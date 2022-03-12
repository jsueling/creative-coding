const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const { Pane } = require('tweakpane')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const params = {
  divider: 540
}

let manager
let typedText = []
let word = []
let fontSize
let typeFontSize
let fontFamily = 'Arial'
let timeoutID

const secondCanvas = document.createElement('canvas');
const secondContext = secondCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {
  let imageData

  const agents = []

  const cell = 30;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  
  fontSize = width * 0.5
  typeFontSize = cols * 0.5

  secondCanvas.width  = cols;
  secondCanvas.height = rows;

  const numCells = cols * rows;
  
  return () => {
    context.save()
    context.fillStyle = 'grey';
    context.fillRect(0, 0, width, params.divider);
    context.fillStyle = 'black'
    context.fillRect(0, params.divider, width, height - params.divider)
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
      agents.forEach((agent) => {
        agent.draw(context)
        agent.update()
      })
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
  manager.render()

  if (timeoutID) clearTimeout(timeoutID) // clears previous keyDown setTimeouts

  timeoutID = setTimeout(() => {
    word = [...typedText] // copy typedText
    typedText = []
    manager.render()
  }, 3000)
}

document.addEventListener('keydown', onKeyDown);

const createPane = () => {
  const pane = new Pane()
  pane.addInput(params, 'divider', { min: 0, max: 1080, step: 1})
}

const start = async () => {
  createPane()
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
    this.origin = new Vector(x, y)
    this.rgb = rgb
    this.radius = radius
    this.vel = new Vector(random.range(-0.05, 0.05), random.range(0.5, 1))
  }

  update() {
    if (this.pos.y > params.divider) { // down
      this.pos.y += this.vel.y
    } else { // up
      this.pos.y -= this.vel.y
    }
    this.pos.x += this.vel.x // wiggle
  }

  draw(context) {
    if (this.pos.y > params.divider) {
      // TODO: gravity effect on these
      context.save()
      context.translate(this.pos.x, this.pos.y)
      context.fillStyle = `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`
      context.beginPath()
      context.arc(0, 0, this.radius, 0, 2*Math.PI)
      context.fill()
      context.restore()
    } else {
      // draws black circle at origin of agent
      context.save()
      context.translate(this.pos.x, this.pos.y)
      context.fillStyle = `rgb(${255-this.rgb.r}, ${255-this.rgb.g}, ${255-this.rgb.b})`
      context.beginPath()
      context.arc(0, 0, this.radius, 0, 2*Math.PI)
      context.fill()
      context.restore()
    }
  }
}