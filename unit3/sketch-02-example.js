const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const { Pane } = require('tweakpane')

const settings = {
	dimensions: [ 1080, 1080 ],
	animate: true
};

const params = {
	num: 10,
	freq: 0.0000001,
	amp: 1
}

const sketch = () => {
	return ({ context, width, height, frame }) => {
		context.fillStyle = 'white';
		context.fillRect(0, 0, width, height);

		context.fillStyle = 'black';

		const cx = width  * 0.5;
		const cy = height * 0.5;

		const w = width  * 0.01;
		const h = height * 0.1;
		let x, y;

		const radius = width * 0.3;

		for (let i = 0; i < params.num; i++) {
			const slice = math.degToRad(360 / params.num);
			const angle = slice * i;

			x = cx + radius * Math.sin(angle);
			y = cy + radius * Math.cos(angle);

			const noise = random.noise2D(x, y, params.freq * frame/10000, params.amp) // -1, 1

			context.save();
			context.translate(x, y);
			context.rotate(-angle);
			context.scale(noise+1, (noise+1)/2);

			context.beginPath();
			context.rect(-w * 0.5, math.mapRange(noise, -1, 1, 0, -h * 0.5), w, h);
			context.fill();
			context.restore();

			context.save();
			context.translate(cx, cy);
			context.rotate(-angle);

			context.lineWidth = math.mapRange(noise, -1, 1, 5, 20);

			context.beginPath();
			context.arc(0, 0, radius * math.mapRange(noise, -1, 1, 0.7, 1.3), slice * math.mapRange(noise, -1, 1, 1, 8), slice * math.mapRange(noise, -1, 1, 1, 5));
			context.stroke();

			context.restore();
		}
	};
};

const createPane = () => {
	const pane = new Pane()
	const settings = pane.addFolder({ title: 'settings' })
	settings.addInput(params, 'num', { min: 0, max: 100, step: 1 })
	const noiseFolder = pane.addFolder({ title: 'Noise' })
	noiseFolder.addInput(params, 'freq', { min: 0, max: 0.1, step: 0.000001 })
	noiseFolder.addInput(params, 'amp', { min: 0, max: 3, step: 0.0001 })
}

createPane()

canvasSketch(sketch, settings);
