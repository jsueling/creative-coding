const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math')

const settings = {
  dimensions: [ 1080, 1080 ],
	animate: true
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

		if (r === 0 &&  g === 0 && b === 0) continue // don't need to render black agents on black

		// x,y are top left corner coordinates, add cell/2 to translate to centre

		const midX = x + cell/2
		const midY = y + cell/2

		const hyp = Math.sqrt(Math.abs(width/2 - midX)**2 + Math.abs(height/2 - midY)**2)
		const adj = Math.abs(width/2 - midX)

		let angleFromMid = Math.acos(adj/hyp) // in radians

		// quadrants
		if (midX > width/2 && midY <= height/2) { // top right
			// pass
		}
		else if (midX <= width/2 && midY <= height/2) { // top left
			angleFromMid = Math.PI - angleFromMid
		}
		else if (midX <= width/2 && midY > height/2) { // bot left
			angleFromMid += Math.PI
		}
		else if (midX > width/2 && midY > height/2) { // bot right
			angleFromMid *= -1
		}

		const velx =  1 * Math.cos(angleFromMid) // x,y position on unit circle from angle to get vel
		const vely =  -1 * Math.sin(angleFromMid) // correct our inverted y axis (-1 => 1)

		agents.push(new Agent(x, y, cell/2, {r,g,b}, velx, vely))

	}

  return () => {
		context.fillStyle = 'black' // loop: reset frame by filling with black rectangle => agents updated => new agents drawn => back to reset
		context.fillRect(0, 0, width, height)

		agents.forEach((a) => {
			a.update(context)
			a.draw(context, width, height)
		})

		// context.fillStyle='red' reference point
		// context.beginPath()
		// context.arc(540,540,cell/2,0,2*Math.PI)
		// context.fill()
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
	constructor(x, y, radius, rgb, velx, vely) {
		this.pos = new Vector(x, y);
		this.vel = new Vector(velx, vely)
		this.rad = radius
		this.rgb = rgb
		this.initPos = new Vector(x, y) // initial position TODO wrap animation
	}

	update() {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}

	draw(context) {
		context.save();
		context.translate(this.pos.x, this.pos.y) // translate to top left corner of cell
		context.translate(this.rad, this.rad) // translate to mid
		const { r, g, b } = this.rgb
		context.fillStyle = `rgb(${r},${g},${b})` // colour
		context.beginPath();
		context.arc(0, 0, this.rad, 0, 2*Math.PI);
		context.fill();

		context.restore();
	}
}