const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const { Pane } = require('Tweakpane')

const settings = {
	dimensions: [ 1080, 1080 ],
	animate: true
};

const animate = () => {
	console.log('domestika');
	requestAnimationFrame(animate);
};
// animate();

const params = {
	radius: 10,
	innerColour: { r: 0, g: 0, b: 0 }
}

const sketch = ({ context, width, height }) => {
	const agents = [];

	for (let i = 0; i < 3; i++) {
		const x = random.range(0, width);
		const y = random.range(0, height);

		agents.push(new Agent(x, y, params.radius));
	}

	return ({ context, width, height }) => {
		context.fillStyle = 'black';
		context.fillRect(0, 0, width, height);
		context.strokeStyle = 'white'
		for (let i = 0; i < agents.length; i++) {
			const agent = agents[i];

			for (let j = i + 1; j < agents.length; j++) {
				const other = agents[j];

				const dist = agent.pos.getDistance(other.pos);

				// if (dist > 200) continue;

				context.lineWidth = 5 // math.mapRange(dist, 0, 200, 5, 0.00001);

				context.beginPath();
				context.arc(agent.pos.x,agent.pos.y,dist,0,2*Math.PI);
				context.stroke()
				context.beginPath()
				context.arc(other.pos.x,other.pos.y,dist,0,2*Math.PI);
				context.stroke();
			}
		}

		agents.forEach(agent => {
			agent.update();
			agent.draw(context);
			agent.bounce(width, height);
		});
	};
};

const createPane = () => {
	const pane = new Pane()

	const settings = pane.addFolder({ title: 'Settings' })
	settings.addInput(params, 'radius', {
		min: 1, max:100, step: 1
	})
	settings.addInput(params, 'innerColour')
	// settings.addInput(params, 'numAgents', {
	// 	label: 'number of agents', min: 1, max: 100, step: 1
	// }))
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

class Agent {
	constructor(x, y) {
		this.pos = new Vector(x, y);
		this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
		this.radius = random.range(4, 12);
	}

	bounce(width, height) {
		if (this.pos.x <= 0 || this.pos.x >= width)  this.vel.x *= -1;
		if (this.pos.y <= 0 || this.pos.y >= height) this.vel.y *= -1;
	}

	update() {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}

	draw(context) {
		context.save();
		context.translate(this.pos.x, this.pos.y);

		const { r: ri, g: gi, b: bi } = params.innerColour
		context.lineWidth = 4;
		context.strokeStyle = `rgb(${ri},${gi},${bi})`
		context.beginPath();
		context.arc(0, 0, params.radius, 0, Math.PI * 2);
		context.stroke();

		context.restore();
	}
}