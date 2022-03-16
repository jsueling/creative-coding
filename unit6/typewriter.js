const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const { Pane } = require('tweakpane')

/**
 * Resources:
 * https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
 * https://www.kirupa.com/canvas/creating_motion_trails.htm
 */

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const params = {
  // TODO
}

let manager
let typedText = []
let word = []
let fontSize
let typeFontSize
let fontFamily = 'Arial'
let timeoutID

let startTime

const secondCanvas = document.createElement('canvas');
const secondContext = secondCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {
  let imageData

  const agents = []

  const cell = 3;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  
  fontSize = width * 0.06
  typeFontSize = cols * 0.06

  secondCanvas.width  = cols;
  secondCanvas.height = rows;

  const numCells = cols * rows;
  
  return ({ time }) => {
    const playhead = Math.round(time*10) / 10 % 1 // 0.1 => 1.0

    context.fillStyle = 'white'
    context.font = `${fontSize}px ${fontFamily}`
    context.textBaseline = 'middle'
    context.textAlign = 'center'

    secondContext.fillStyle = 'white'
    secondContext.font = `${typeFontSize}px ${fontFamily}`
    secondContext.textBaseline = 'middle'
    secondContext.textAlign = 'center'

    context.save()
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)
    context.restore()

    if (word.length) { // create and push agents to array using the image data of the secondContext

      imageData = secondContext.getImageData(0, 0, cols, rows);

      for (let i = 0; i < numCells; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const x = col * cell
        const y = row * cell
        const r = imageData.data[i * 4 + 0]
        const g = imageData.data[i * 4 + 1]
        const b = imageData.data[i * 4 + 2]

        posX = x + cell/2
        posY = y + cell/2

        if (r < 100) continue

        agents.push(new Agent(posX, posY, { r, g, b }, cell/2))
      }

      startTime = time // begin timer
      word = [] // clear the word to allow more agents to be created
    }

    if (typedText.length) {

      const text = typedText.length ? typedText.join('') : word.join('')
      const lines = text.split("\n") // get text and split into array of lines
  
      // draw on main context
      context.save()
      context.translate(width/2, height/2)

      const metrics = context.measureText(text)
      const lineHeight = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) * 1.05 // 5% gap
      const totalHeight = lines.length * lineHeight

      let yOffset = -totalHeight/2 + lineHeight/2 // yOffset begins based on total height of all lines

      for (let i = 0; i < lines.length; ++i) { // for each line, add yOffset for new line
        context.fillText(lines[i], 0, yOffset);

        if (i === lines.length-1) { // blinking half second pipe on last line
          const lastLineMetrics = context.measureText(lines[lines.length-1])
          if (playhead < 0.5) {
            context.fillText("|", lastLineMetrics.actualBoundingBoxRight * 1.05, yOffset)
          }
        }

        yOffset += lineHeight
      }

      context.restore()

      // clear the canvas
      secondContext.save()
      secondContext.fillStyle = 'black';
      secondContext.fillRect(0, 0, cols, rows);
      secondContext.restore()

      // write on secondContext using typedText
      secondContext.save()
      secondContext.translate(cols/2, rows/2)

      const secondMetrics = secondContext.measureText(text)
      const secondLineHeight = (secondMetrics.actualBoundingBoxAscent + secondMetrics.actualBoundingBoxDescent) * 1.1
      const secondTotalHeight = lines.length * secondLineHeight

      let secondYOffset = -secondTotalHeight/2 + secondLineHeight/2

      for (let i = 0; i < lines.length; ++i) {
        secondContext.fillText(lines[i], 0, secondYOffset);
        secondYOffset += secondLineHeight
      }

      secondContext.restore()
    } else if (!word.length && !typedText.length) {
      if (playhead < 0.5) {
        context.save()
        context.fillStyle = 'white'
        context.translate(width/2, height/2)
        context.fillText("|", 0, 0)
        context.restore()
      }
    }
    
    if (agents.length) {

      const restitution = 0.8

      const currentTime = time-startTime // when this loop starts currentTime is 0

      for (let i=0; i < agents.length; i++) {
        agents[i].update(currentTime, height)
      }

      // object-to-object collision detection/resolution
      for (let i=0; i < agents.length; i++) {
        let a = agents[i]
        for (let j=i+1; j < agents.length; j++) {
          let b = agents[j]
          if (circleInstersect(a, b)) {

            let vCollision = new Vector(b.pos.x - a.pos.x, b.pos.y - a.pos.y) // collision vector with magnitude
            let distance = Math.sqrt((b.pos.x - a.pos.x)**2 + (b.pos.y - a.pos.y)**2)
            let vCollisionNorm = new Vector(vCollision.x/distance, vCollision.y/distance) // normalized collision vector, direction only

            let vRelativeVelocity = new Vector(a.vel.x - b.vel.x, a.vel.y - b.vel.y) // relative velocity vector of the 2 objects at collision
            let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y // dot product of normalized collision vector and the relative velocity vector

            if (speed < 0) { // negative or 0 dot product we can ignore because the objects are moving away from each other
              continue
            }

            speed *= restitution

            a.vel.x -= speed * vCollisionNorm.x
            a.vel.y -= speed * vCollisionNorm.y
            b.vel.x += speed * vCollisionNorm.x
            b.vel.y += speed * vCollisionNorm.y
          }
        }
      }

      // object-boundary collision detection/resolution
      for (let i=0; i < agents.length; i++) {
        agents[i].bounce(width, height, restitution)
      }

      for (let i=0; i < agents.length; i++) {
        agents[i].draw(context)
      }

      // single agent test
      // agents[0].update(currentTime, height)
      // agents[0].bounce(width, height, restitution)
      // agents[0].draw(context)

    }
  };
};

/**
 * onKeyDown fills typedText array which is rendered to the screen immediately.
 * the setTimeout to fill word is debounced so typedText gets copied into word/typedText gets cleared
 * only after inactivity. word.length > 0 triggers the next animation
 */
const onKeyDown = (e) => {
  if (e.key == 'Backspace') { // backspace removes last char
    typedText.pop()
  } else if (e.key.length === 1) { // single keys only
    typedText.push(e.key)
  } else if (e.key == 'Enter') { // line break
    typedText.push('\n')
  }

  manager.render()

  if (timeoutID) clearTimeout(timeoutID) // clears previous keyDown setTimeouts

  timeoutID = setTimeout(() => {
    word = [...typedText] // copy typedText
    typedText = []
    manager.play() // https://github.com/mattdesl/canvas-sketch/blob/master/docs/api.md#sketchmanager
  }, 1000)
}

document.addEventListener('keydown', onKeyDown);

const createPane = () => {
  const pane = new Pane()
}

const start = async () => {
  // createPane()
  manager = await canvasSketch(sketch, settings);
}

start()

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Agent {
  constructor(x, y, rgb, radius) {
    this.pos = new Vector(x, y)
    this.rgb = rgb
    this.radius = radius
    this.vel = new Vector(random.range(-0.1, 0.1), 0)
    this.prevTime = 0
  }

  update(currentTime, height) {
    const secondsPassed = currentTime - this.prevTime
    this.prevTime = currentTime
    const g = 9.81; // Gravitational acceleration

    // chaotic implementation, currentTime gets reset to 0 when the setTimeout returns
    this.vel.y += g * secondsPassed * 0.5

    // normal implementation
    // if (this.pos.y > height-this.radius*2 && this.vel.y >= -1) { // agent should settle if its upward velocity is low enough and it is close to floor
    //   this.vel.y = 0
    // } else {
    //   this.vel.y += g * secondsPassed // accelerate to the ground while off the ground
    // }

    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
  }

  bounce(width, height, restitution) {

    if (this.pos.x < 0 + this.radius) {
      this.vel.x *= -1 * restitution
      this.pos.x = this.radius
    } else if (this.pos.x > width-this.radius) {
      this.vel.x *= -1 * restitution
      this.pos.x = width-this.radius
    }

    if (this.pos.y > height-this.radius) {
      this.vel.y *= -1 * restitution
      this.pos.y = height-this.radius
    } else if (this.pos.y < 0 + this.radius) {
      this.vel.y *= -1 * restitution
      this.pos.y = this.radius
    }
  }

  draw(context) {
    context.save()
    context.translate(this.pos.x, this.pos.y)
    context.fillStyle = `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`
    context.beginPath()
    context.arc(0, 0, this.radius, 0, 2*Math.PI)
    context.fill()
    context.restore()
  }
}

function circleInstersect(agent1, agent2) { // returns boolean if circles intersect
  const squareDistance = (agent1.pos.x - agent2.pos.x)**2 + (agent1.pos.y - agent2.pos.y)**2 // dx**2 + dy**2
  return squareDistance <= (agent1.radius + agent2.radius)**2 // distance between >= sum of radii (both squared)
}