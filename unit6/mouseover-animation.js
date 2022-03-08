const canvasSketch = require('canvas-sketch');
const random  = require('canvas-sketch-util/random')
const math  = require('canvas-sketch-util/math')
const { Pane } = require('tweakpane')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const params = {
  freq: 0.0032,
  lineWidth: 1
}

// Mouseover in canvas thanks to:
// https://stackoverflow.com/a/54805456
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height, canvas }) => { // https://github.com/mattdesl/canvas-sketch/blob/master/docs/api.md#dom-props

  const img = new Image()
  img.src = 'woman-grayscale.jpg' // local image

  const agents = [];

  const cell = 7;
	const cols = Math.floor(width  / cell);
	const rows = Math.floor(height / cell);
	const numCells = cols * rows;

  // draw on typeContext
	typeCanvas.width  = cols;
	typeCanvas.height = rows;
	typeContext.fillStyle = 'black';
	typeContext.fillRect(0, 0, cols, rows);

  typeContext.drawImage(img, 0, 0, rows, cols)

  // extract pixel data from typeContext
  const typeData = typeContext.getImageData(0, 0, cols, rows).data;

  // create agents based on pixel data
  for (let i = 0; i < numCells; i++) {
		const col = i % cols;
		const row = Math.floor(i / cols);

		const x = col*cell + cell/2 // x,y always points to the middle of the agent cell
		const y = row*cell + cell/2 // + random.range(-3, 3) for blur

    const rgb = {
      r: typeData[i * 4 + 0],
      g: typeData[i * 4 + 1],
      b: typeData[i * 4 + 2]
      // a: typeData[i * 4 + 3] // alpha
    }

    if (rgb.r < 10) continue

		const hyp = Math.sqrt((width/2 - x)**2 + (height/2 - y)**2)
		const adj = Math.abs(width/2 - x)
		let angleFromMid = Math.acos(adj/hyp) // find angle between mid and this agent using trigonometry

    // quadrants
		if (x > width/2 && y <= height/2) { // top right
			// pass
		} else if (x <= width/2 && y <= height/2) { // top left
			angleFromMid = Math.PI - angleFromMid
		} else if (x <= width/2 && y > height/2) { // bot left
			angleFromMid += Math.PI
		} else if (x > width/2 && y > height/2) { // bot right
			angleFromMid *= -1
		}

    const midToCornerDistance = Math.sqrt((width/2)**2 + (height/2)**2)

    const randomOffsetDistance = random.range(midToCornerDistance * 1.5, midToCornerDistance * 2.9  ) // render agents outside of view * random factor

    const curX = width/2 + randomOffsetDistance * Math.cos(angleFromMid) // get current x,y positions using trig
    const curY = height/2 - randomOffsetDistance * Math.sin(angleFromMid) // y is inverted top 0 -> bot 1080

    const speedFactor = 180 // params.speedFactor

    const velx = speedFactor * Math.cos(angleFromMid) // x,y of unit circle through destination from mid outwards
    const vely = speedFactor * -1 * Math.sin(angleFromMid) // y is inverted top 0 -> bot 1080

		agents.push(new Agent(curX, curY, x, y, cell/2, rgb, velx, vely)) // each agent has radius 1/2 of cell width, x,y is top left corner of cell
	}

  let cursor = new Cursor(0, 0) // initialize cursor
  
  canvas.onmousemove = (e) => { // update cursor on canvas mouse move event
    cursor = new Cursor(e.offsetX, e.offsetY)
  }

  // context.save() // to not clear previous renders, comment out fillRect
  // context.fillStyle = 'rgb(80,80,80)'
  // context.fillRect(0, 0, width, height) // clear previous renders with black rectangle
  // context.restore()

  return ({ frame }) => {
    // if (frame % 10 == 0) clear canvas every 10 frames
    context.fillRect(0, 0, width, height) // clear previous renders with black rectangle

    // render agents to main canvas
    agents.forEach(agent => {
      agent.update() // moving back to destination
      agent.undulate(frame)
			agent.draw(context)
      cursor.collisionCheck(agent)
		});
  };
};

const createPane = () => {
	const pane = new Pane()
	pane.addInput(params, 'freq', { min: 0.000001, max: 1, step: 0.000001 })
  pane.addInput(params, 'lineWidth', { min: 1, max: 20, step: 0.1 })
}

createPane()
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

  collisionCheck(agent) { // 80% of the time when dist is less than 100
    if (this.getDistance(agent.pos) < Math.round(Math.random()/2 + 0.1) * 100) { // checking distance between cursor and an agent
      agent.hovered = true
      // if (agent.settled) {
      agent.pos.x += agent.vel.x * 1.2 // moving away from the midPoint
      agent.pos.y += agent.vel.y * 1.2
      // }
    } else {
      agent.hovered = false
    }
  }
}

class Agent {
	constructor(x, y, destX, destY, radius, rgb, velx, vely) {
    // current
		this.pos = new Vector(x, y)
    this.radius = radius
		this.vel = new Vector(velx, vely);
    this.r = rgb.r
    this.g = rgb.g
    this.b = rgb.b
    this.hovered = false
    this.settled = false
    this.startAngle = 0
    this.endAngle = 2 * Math.PI

    // record
    this.destination = new Vector(destX, destY);
    this.originalDist = this.pos.getDistance(this.destination)
    this.originalRadius = radius
    this.mid = new Vector(540, 540)
	}

	update() {
    const dist = this.pos.getDistance(this.destination)
    if (dist > 0.1) {
      this.settled = false
      this.pos.x -= this.vel.x * (dist/this.originalDist); // decelerates closing on its destination
      this.pos.y -= this.vel.y * (dist/this.originalDist); // (dist/this.originalDist) varies from 1 to 0
    } else {
      this.settled = true // stop if close enough
    }
	}

  undulate(frame) {
    const noise = random.noise3D(this.pos.x, this.pos.y, frame * 10, params.freq, 1) // current frame is the 3rd dimension, outputs -1 -> +1

    // noise associated with r value of agent
    const uniqueNoise = random.noise2D(this.r, frame*10, params.freq, 1) // this.pos.getDistance(this.mid)

    // if (this.settled) {
    //   const posNoise = random.noise3D(this.pos.x, this.pos.y, frame * 10, 0.00001, 1)
    //   const posOffset = math.mapRange(posNoise, -1, 1, -this.radius/1000, this.radius/1000)
    //   this.pos.x = this.destination.x + posOffset
    //   this.pos.y = this.destination.y + posOffset
    // }

    const newRadius = math.mapRange(uniqueNoise, -1, 1, 0.9, 1.1)
    this.radius = this.originalRadius * newRadius

    const newStartAngle = math.mapRange(uniqueNoise, -1, 1, 0, 2*Math.PI)
    this.startAngle = newStartAngle
    this.endAngle = 2*Math.PI - newStartAngle
  }

	draw(context) {
		context.save();
    context.translate(this.pos.x, this.pos.y)
    context.lineWidth = params.lineWidth
    context.strokeStyle = `rgb(${this.r}, ${this.g}, ${this.b})` // this.hovered ? 'blue' :
    // context.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})` // conditionally change colour on hover // this.hovered ? 'blue' : 
    // context.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`
    context.beginPath()
    context.arc(0, 0, this.radius, this.startAngle, this.endAngle)
    context.stroke()
    // context.fill()
		context.restore();
	}
}

// https://gist.github.com/gre/1650294 + https://youtu.be/u_wmz0H4nKw?t=1331
function ease(t) {
  return t<.5 ? 2*t*t : -1+(4-2*t)*t
}