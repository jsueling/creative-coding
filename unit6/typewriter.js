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

  const cell = 5;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  
  fontSize = width * 0.3
  typeFontSize = cols * 0.3

  secondCanvas.width  = cols;
  secondCanvas.height = rows;

  const numCells = cols * rows;
  
  return ({ time }) => {
    context.save()
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)
    context.restore()

    if (word.length && !agents.length) { // fill agents once using the image data of the secondContext

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

    } else if (typedText.length) {
      context.fillStyle = 'white'
      context.font = `${fontSize}px ${fontFamily}`
      context.textBaseline = 'middle'
      context.textAlign = 'center'
  
      // draw on main context
      context.save()
      context.translate(width/2, height/2)
      context.fillText(typedText.length ? typedText.join('') : word.join(''), 0, 0)
      context.restore()
  
      secondContext.fillStyle = 'white'
      secondContext.font = `${typeFontSize}px ${fontFamily}`
      secondContext.textBaseline = 'middle'
      secondContext.textAlign = 'center'

      // clean the canvas
      secondContext.save()
      secondContext.fillStyle = 'black';
      secondContext.fillRect(0, 0, cols, rows);
      secondContext.restore()

      // write on secondContext using typedText
      secondContext.save()
      secondContext.translate(cols/2, rows/2)
      secondContext.fillText(typedText.join(''), 0, 0)
      secondContext.restore()
    }
    
    if (agents.length) {

      const restitution = 0.9

      const currentTime = time-startTime // when this loop starts

      for (let i=0; i < agents.length; i++) {
        agents[i].update(currentTime)
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
      // agents[0].update(currentTime)
      // agents[0].bounce(width, height, restitution)
      // agents[0].draw(context)

    }
  };
};

/**
 * onKeyDown fills typedText array which is rendered to the screen immediately.
 * It is debounced by a setTimeout so typedText gets copied into word/typedText gets cleared
 * only after inactivity. truthy word triggers the next animation
 */
const onKeyDown = (e) => {
  if (e.key == 'Backspace') { // backspace removes last char
    typedText.pop()
    fontSize /= 0.95
    typeFontSize /= 0.95
  } else if (e.key.length === 1) { // single keys only
    typedText.push(e.key)
    fontSize *= 0.95
    typeFontSize *= 0.95
  }

  if (timeoutID) clearTimeout(timeoutID) // clears previous keyDown setTimeouts

  timeoutID = setTimeout(() => {
    word = [...typedText] // copy typedText
    typedText = []
  }, 3000)
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
  }

  update(currentTime) {
    let prevTime = 0
    const secondsPassed = currentTime - prevTime
    prevTime = currentTime
    const g = 9.81;

    this.vel.y += g * secondsPassed * 0.01 // 0.01 * Gravitational acceleration
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