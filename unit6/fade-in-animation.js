const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math')
const random = require('canvas-sketch-util/random')
const { Pane } = require('tweakpane')

const settings = {
  dimensions: [ 1080, 1080 ],
	animate: true
};

const params = {
	redFilter: 0
}

let img

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {

  const cell = 7;
	const cols = Math.floor(width  / cell);
	const rows = Math.floor(height / cell);
	const numCells = cols * rows;

	typeCanvas.width  = cols;
	typeCanvas.height = rows;
	typeContext.fillStyle = 'black';
	typeContext.fillRect(0, 0, cols, rows);

	typeContext.drawImage(img, 0, 0, cols, rows) // draws fetched image

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

		// if (i % 7 == 0) continue
		if (r < 100) continue // choose which colours based on rgb to create as agents/render to screen

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
		const zoomEffect = math.mapRange(hyp, 0, width/2, 0.1, 30) // zoom effect, speed is mapped to distance from mid which is increasing with distance from mid
		const mapRadius = math.mapRange(hyp, 200, width/2, 0.4, 0.9) // radius mapped to distance from mid, decreasing with distance from mid
		const speedFactor = random.range(1, 3) // random speeds from mid  // zoomEffect
		const radiusFactor = 0.6 // random.range(1, 1.3) // random radius of pixel // 1.5 - mapRadius 

		const velx =  speedFactor * Math.cos(angleFromMid) // x, y position from angle to get vel * radius (speed)
		const vely =  -speedFactor * Math.sin(angleFromMid) // correct our inverted y axis *= -1

		agents.push(new Agent(x, y, radiusFactor * cell/2, {r,g,b}, velx, vely))

	}

  return ({ time }) => {
		context.fillStyle = 'black' // loop: reset frame by filling with black rectangle => agents updated => new agents drawn => back to reset
		context.fillRect(0, 0, width, height)

		// agents[0].update(time) // test single agent
		// agents[0].draw(context, width, height)

		agents.forEach((a) => {
			a.update(time)
			a.draw(context, params.redFilter)
		})

		// context.fillStyle='red' // test reference point
		// context.beginPath()
		// context.arc(540,540,cell/2,0,2*Math.PI)
		// context.fill()
  };
};

const createPane = () => {
	const pane = new Pane()
	pane.addInput(params, 'redFilter', { min: 90, max: 255, step: 1 })
}

const url = 'https://i.picsum.photos/id/972/1080/1080.jpg?grayscale&hmac=gb0H_hVYBXNg9JXq5eC81eOe30suZZw0KVcyzh0lmgk' // https://picsum.photos/1080

const loadImage = (url) => {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = () => rej()
		img.crossOrigin = "Anonymous" // https://stackoverflow.com/a/27840082
    img.src = url
  })
}

const start = async () => {
  img = await loadImage(url)
	createPane()
	canvasSketch(sketch, settings, img);
}

start()

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

	update(time) {
		const playhead = time % 15 // 0->11 loop
		// pause 1 seconds
		if (playhead > 3 && playhead < 3.5) { // 0.5 growing at x4
			this.pos.x += this.vel.x*4;
			this.pos.y += this.vel.y*4;
			// this.rad /= 0.99
		}	else if (playhead > 11 && playhead < 12 ){ // 1 shrinking at x2
			this.pos.x -= this.vel.x*2;
			this.pos.y -= this.vel.y*2;
			// this.rad *= 0.99
		} else if (playhead > 3.5 && playhead < 7.25) { // 3.25 growing at x1/4
			this.pos.x += this.vel.x/4;
			this.pos.y += this.vel.y/4;
		} else if (playhead > 7.25 && playhead < 11) { // 3.25 shrinking at x1/4
			this.pos.x -= this.vel.x/4;
			this.pos.y -= this.vel.y/4;
		} else if (playhead > 12) { // snaps back into start position and pause 1 seconds
			this.pos.x = this.initPos.x
			this.pos.y = this.initPos.y
		}
	}

	draw(context, redFilter) {
		const { r, g, b } = this.rgb
		if (r > redFilter) {
			context.save();
			context.translate(this.pos.x, this.pos.y) // translate to top left corner of cell
			context.translate(this.rad, this.rad) // translate to mid
			context.fillStyle = `rgb(${r},${g},${b})` // colour
			context.beginPath();
			context.arc(0, 0, this.rad, 0, 2*Math.PI);
			context.fill();

			context.restore();
		}
	}
}