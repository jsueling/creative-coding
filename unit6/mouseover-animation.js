const canvasSketch = require('canvas-sketch');
const random  = require('canvas-sketch-util/random')
const math  = require('canvas-sketch-util/math')
const { Pane } = require('tweakpane')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const params = {
  undulateFreq: 0.00692,
  brushRadius: 200,
  minOffset: -5, 
  maxOffset: 5,
  offSetFreq : 4.101
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

  const cell = 10;
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

    // correct angle depending on quadrant
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

    const randomOffsetDistance = random.range(midToCornerDistance * 1.5, midToCornerDistance * 2.9) // render agents outside of view * randomFactor

    const curX = width/2 + randomOffsetDistance * Math.cos(angleFromMid) // get current x,y positions using trig
    const curY = height/2 - randomOffsetDistance * Math.sin(angleFromMid) // y is inverted top 0 -> bot 1080

    const speedFactor = 180 // larger radius = higher speed

    const velx = speedFactor * Math.cos(angleFromMid) // x,y of unit circle from mid to destination outwards
    const vely = speedFactor * -1 * Math.sin(angleFromMid) // y is inverted top 0 -> bot 1080

		agents.push(new Agent(curX, curY, x, y, cell/2, rgb, velx, vely)) // current x,y destination x,y, radius, rgb value, vector on unit circle to reach destination
	}

  const cursor = new Cursor(0, 0) // initialize cursor
  
  canvas.onmousemove = (e) => { // update cursor on canvas mouse move event
    cursor.x = e.offsetX
    cursor.y = e.offsetY
  }

  return ({ frame }) => {
    context.fillRect(0, 0, width, height) // clear previous renders, comment this out to not clear

    // render agents to main canvas
    agents.forEach(agent => {
      agent.update() // moving back to destination
      agent.undulate(frame, cursor)
			agent.draw(context, frame)
      cursor.collisionCheck(agent)
		});
  };
};

const createPane = () => {
	const pane = new Pane()
	pane.addInput(params, 'undulateFreq', { min: 0.00001, max: 0.05, step: 0.00001 })
  pane.addInput(params, 'brushRadius', { min: 1, max: 2000, step: 1 })
  pane.addInput(params, 'minOffset', { min: -30, max: 0, step: 1 })
  pane.addInput(params, 'maxOffset', { min: 0, max: 30, step: 1 })
  pane.addInput(params, 'offSetFreq', { min: 0.001, max: 10, step: 0.001 })

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

  collisionCheck(agent) {
    const dist = this.getDistance(agent.pos)
    if (dist < params.brushRadius ) { // proceed if agent is close enough to cursor
      agent.hovered = true
      const distFactor = math.mapRange(dist, 0, params.brushRadius, 0, 0.4) 
      agent.pos.x += agent.vel.x * (0.4-distFactor)
      agent.pos.y += agent.vel.y * (0.4-distFactor) // the closer to the cursor, the faster the agent will move away from it
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
    this.lineWidth = 1

    // record
    this.destination = new Vector(destX, destY);
    this.originalDist = this.pos.getDistance(this.destination)
    this.originalRadius = radius
    this.mid = new Vector(540, 540)
    this.originalLineWidth = this.lineWidth
	}

	update() {
    const dist = this.pos.getDistance(this.destination)
    if (dist > 0.1) {
      this.settled = false
      this.pos.x -= this.vel.x * (dist/this.originalDist); // decelerates closing on its destination (dist/this.originalDist) varies from 1 to 0
      this.pos.y -= this.vel.y * (dist/this.originalDist);
    } else {
      this.settled = true // stop if close enough
    }
	}

  undulate(frame, cursor) {
    const posNoise = random.noise3D(this.pos.x, this.pos.y, frame/1000, 0.001, 1) // noise varying with x,y and frame, outputs -1 -> +1
    const radiusFactor = math.mapRange(posNoise, -1, 1, 0.5, 1)
    this.radius = this.originalRadius * radiusFactor

    // noise varying with e.g.:
    // distance from mid, this.pos.getDistance(this.mid)
    // r colour value of agent, this.r
    // distance from cursor, this.pos.getDistance(cursor)
    const otherNoise = random.noise2D(this.r, frame, params.undulateFreq, 1)
    const lineWidthFactor = math.mapRange(otherNoise, -1, 1, 0, 1)
    const newStartAngle = math.mapRange(otherNoise, -1, 1, 0, 2 * Math.PI)

    this.lineWidth = this.originalLineWidth * (1-lineWidthFactor)
    this.startAngle = newStartAngle
    this.endAngle = 2 * Math.PI - newStartAngle
  }

	draw(context, frame) {
    const posNoise = random.noise3D(this.destination.x, this.destination.y, frame*100, 0.00019, 1)
    const redNoise = random.noise2D(this.r, frame/60, params.offSetFreq, 1)
    // must have separate offset for x and y or move in diagonals
    const randomOffsetX = math.mapRange(posNoise, -1, 1, params.minOffset, params.maxOffset)
    const randomOffsetY = math.mapRange(redNoise, -1, 1, params.minOffset, params.maxOffset)
		context.save();
    // instead of changing pos.x or pos.y to get floating agents, we can just translate each agent with some randomOffset generated by noise
    context.translate(this.pos.x + randomOffsetX, this.pos.y + randomOffsetY)
    context.lineWidth = this.lineWidth
    context.strokeStyle = `rgb(${this.r}, ${this.g}, ${this.b})` // can conditionally change with this.hovered or this.settled using ternary operator
    context.beginPath()
    context.arc(0, 0, this.radius, this.startAngle, this.endAngle)
    context.stroke()
		context.restore();
	}
}

// https://gist.github.com/gre/1650294 + https://youtu.be/u_wmz0H4nKw?t=1331
function ease(t) {
  return t<.5 ? 2*t*t : -1+(4-2*t)*t
}