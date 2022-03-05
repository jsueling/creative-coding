const canvasSketch = require('canvas-sketch');
const random  = require('canvas-sketch-util/random')
const math  = require('canvas-sketch-util/math')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

// Mouseover in canvas thanks to:
// https://stackoverflow.com/a/54805456
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height, canvas }) => { // https://github.com/mattdesl/canvas-sketch/blob/master/docs/api.md#dom-props

  const agents = [];

  const cell = 20;
	const cols = Math.floor(width  / cell);
	const rows = Math.floor(height / cell);
	const numCells = cols * rows;

  // draw on typeContext
	typeCanvas.width  = cols;
	typeCanvas.height = rows;
	typeContext.fillStyle = 'black';
	typeContext.fillRect(0, 0, cols, rows);

  typeContext.save()
  typeContext.fillStyle = 'white'
  typeContext.translate(cols/2, rows/2) // mid
  typeContext.beginPath()
  typeContext.arc(0, 0, cols/4, 0, 2*Math.PI)
  typeContext.fill()
  typeContext.restore()

  // extract pixel data from typeContext
  const typeData = typeContext.getImageData(0, 0, cols, rows).data;

  // create agents based on pixel data
  for (let i = 0; i < numCells; i++) {
		const col = i % cols;
		const row = Math.floor(i / cols);

		const x = col * cell;
		const y = row * cell;

    const rgb = {
      r: typeData[i * 4 + 0],
      g: typeData[i * 4 + 1],
      b: typeData[i * 4 + 2]
      // a: typeData[i * 4 + 3] // alpha
    }

    if (rgb.r < 50) continue

		agents.push(new Agent(x, y, cell/4, rgb)) // each agent has radius 1/4 of cell width
	}

  let cursor = new Cursor(0, 0) // initialize cursor
  
  canvas.onmousemove = (e) => { // update cursor on canvas mouse move event
    cursor = new Cursor(e.offsetX, e.offsetY)
  }
  
  return ({ frame }) => {
    context.fillRect(0, 0, width, height) // clear previous renders with black rectangle

    // const playhead = time % 1

    // single agent test
    // agents[0].undulate(frame)
    // agents[0].draw(context) 
    // cursor.collisionCheck(agents[0])

    // render agents to main canvas
    agents.forEach(agent => {
      // agent.update();
      agent.undulate(frame)
			agent.draw(context);
      cursor.collisionCheck(agent)
		});
  };
};

canvasSketch(sketch, settings);

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	getDistance(v) {
		const dx = this.x - v.x;
		const dy = this.y - v.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
}

class Cursor extends Vector {
  constructor(x, y) {
    super(x, y);
  }

  collisionCheck(agent) {
    if (this.getDistance(agent.midPoint) < 150) { // checking distance between cursor and an agent
      agent.hovered = true
    } else {
      agent.hovered = false
    }
  }
}

class Agent {
	constructor(x, y, radius, rgb) {
		this.pos = new Vector(x, y);
		// this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
    this.originalRadius = radius
    this.radius = radius
    this.midPoint = new Vector(this.pos.x + this.radius, this.pos.y + this.radius) // correct position of mid relative to top left corner of the agent
    this.r = rgb.r
    this.g = rgb.g
    this.b = rgb.b
    this.hovered = false
	}

	update() {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}

  undulate(frame) {
    const noise = random.noise3D(this.midPoint.x, this.midPoint.y, frame * 10, 0.001, 1) // current frame is the 3rd dimension, outputs -1 -> +1
    const newRadius = math.mapRange(noise, -1, 1, this.originalRadius * 0.2, this.originalRadius * 1.8)
    // console.log(this.r, this.g, this.b);
    // TODO: mapRange r, g or b using noise 0 -> 255
    // https://github.com/mattdesl/canvas-sketch-util/blob/master/docs/math.md#damp
    this.radius = newRadius
  }

	draw(context) {
		context.save();
    context.translate(this.midPoint.x, this.midPoint.y)
    context.fillStyle = this.hovered ? 'black' : `rgb(${this.r}, ${this.g}, ${this.b})` // conditionally change colour on hover
    // TODO: mapRange endAngle of stroke using noise 0 -> 2*Math.PI
    // context.strokeStyle = this.hovered ? 'black' : `rgb(${this.r}, ${this.g}, ${this.b})`
    context.beginPath()
    context.arc(0, 0, this.radius, 0, 2*Math.PI)
    // context.stroke()
    context.fill()
		context.restore();
	}
}