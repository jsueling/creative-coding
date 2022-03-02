const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {

  const cell = 20;
	const cols = Math.floor(width  / cell);
	const rows = Math.floor(height / cell);
	const numCells = cols * rows;

	typeCanvas.width  = cols;
	typeCanvas.height = rows;
	typeContext.fillStyle = 'black';
	typeContext.fillRect(0, 0, cols, rows);

	typeContext.fillStyle = 'white'
	typeContext.save()
	typeContext.translate(cols/2, rows/2)

	typeContext.beginPath()
	typeContext.arc(0, 0, cols/6, 0, 2*Math.PI)
	typeContext.fill()

	typeContext.restore()

	const typeData = typeContext.getImageData(0, 0, cols, rows).data;

	context.fillStyle = 'black';
	context.fillRect(0, 0, width, height);

	// context.drawImage(typeCanvas, 0, 0); // check typeCanvas is correct

	const agents = []

	for (let i = 0; i < numCells; i++) { // moved outside of the animation, initial points
		const col = i % cols;
		const row = Math.floor(i / cols);

		const x = col * cell;
		const y = row * cell;

		const r = typeData[i * 4 + 0];
		const g = typeData[i * 4 + 1];
		const b = typeData[i * 4 + 2];
		// const a = typeData[i * 4 + 3] // rgba alpha

		context.fillStyle = `rgb(${r}, ${g}, ${b})` // colour each cell using typeData

		if (r === 0 &&  g === 0 && b === 0) continue // don't need to render black agents on black

		agents.push(new Agent(x, y, cell/2, { r, g, b }))
	}

  return () => {
		agents.forEach((a) => {
			// a.update()
			a.draw(context)
		})
  };
};

canvasSketch(sketch, settings);


class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Agent {
	constructor(x, y, radius, rgb) {
		this.pos = new Vector(x, y);
		this.vel = // todo, angle from centre
		this.rad = radius
		this.rgb = rgb
		this.initPos = new Vector(x, y) // record of initial position
	}

	update() {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}

	draw(context) {
		context.save();
		context.translate(this.pos.x, this.pos.y) // translate to top left
		context.translate(this.rad/2, this.rad/2) // translate to mid

		context.fillStyle = `rgb(${this.rgb.r},${this.rgb.g},${this.rgb.b})` // colour
		context.beginPath();
		context.arc(0, 0, this.rad, 0, 2*Math.PI);
		context.fill();

		context.restore();
	}
}