const canvasSketch = require('canvas-sketch');
const random  = require('canvas-sketch-util/random')
const math  = require('canvas-sketch-util/math')

const settings = {
  dimensions: [ 1080, 1080 ]
};

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {
  const agents = [];

  const cell = 20;
	const cols = Math.floor(width  / cell);
	const rows = Math.floor(height / cell);
	const numCells = cols * rows;

	typeCanvas.width  = cols;
	typeCanvas.height = rows;
	typeContext.fillStyle = 'white';
	typeContext.fillRect(0, 0, cols, rows);

  typeContext.save()
  typeContext.translate(cols/4, rows/4)
  typeContext.fillStyle = 'black'
  typeContext.fillRect(0, 0, cols/2, rows/2);
  typeContext.restore()

  // const testRad = 5
  // typeContext.fillStyle='black'
  // typeContext.save()
  // typeContext.translate(cols/4,cols/4)
  // typeContext.beginPath()
  // typeContext.arc(0,0, testRad, 0, 2*Math.PI)
  // typeContext.fill()
  // typeContext.restore()
  // typeContext.save()
  // typeContext.translate(cols*3/4,rows/4)
  // typeContext.beginPath()
  // typeContext.arc(0,0, testRad, 0, 2*Math.PI)
  // typeContext.fill()
  // typeContext.restore()
  // typeContext.save()
  // typeContext.translate(cols*3/4,rows*3/4)
  // typeContext.beginPath()
  // typeContext.arc(0,0, testRad, 0, 2*Math.PI)
  // typeContext.fill()
  // typeContext.restore()
  // typeContext.save()
  // typeContext.translate(cols/4,rows*3/4)
  // typeContext.beginPath()
  // typeContext.arc(0,0, testRad, 0, 2*Math.PI)
  // typeContext.fill()
  // typeContext.restore()

  const typeData = typeContext.getImageData(0, 0, cols, rows).data;

  for (let i = 0; i < numCells; i++) { // moved outside of the animation, initial points
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

		agents.push(new Agent(x, y, cell/2, cell/2, rgb))
	}

  return () => {
    agents.forEach(agent => {
			// agent.update();
			agent.draw(context);
		});
  };
};

canvasSketch(sketch, settings);

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	// getDistance(v) {
	// 	const dx = this.x - v.x;
	// 	const dy = this.y - v.y;
	// 	return Math.sqrt(dx * dx + dy * dy);
	// }
}

class Agent {
	constructor(x, y, width, height, rgb) {
		this.pos = new Vector(x, y);
		this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
    this.width = width
    this.height = height
    this.r = rgb.r
    this.g = rgb.g
    this.b = rgb.b
	}

	update() {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}

	draw(context) {
		context.save();
		context.translate(this.pos.x, this.pos.y);
    context.translate(this.width/2, this.height/2)
    context.fillStyle = `rgb(${this.r}, ${this.g}, ${this.b})`
		context.fillRect(0, 0, this.width, this.height);
		context.restore();
	}
}