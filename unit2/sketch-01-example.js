const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const { Pane } = require('tweakpane')

const settings = {
  dimensions: [ 1080, 1080 ],
	animate: true
};

const params = {
	freq: 0.0005,
	amp: 10,
	innerColour: { r: 0, g: 255, b: 0 }
}

const sketch = () => {
  return ({ context, width, height, frame }) => {
		const { r: ri, g: gi, b: bi } = params.innerColour

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    context.lineWidth = width * 0.01;

    const w 	= width  * 0.10;
		const h 	= height * 0.10;
		const gap = width  * 0.03;
		const ix 	= width  * 0.17;
		const iy 	= height * 0.17;

		const off = width  * 0.02;

		let x, y;

		
		for (let i = 0; i < 5; i++) {
			for (let j = 0; j < 5; j++) {
				x = ix + (w + gap) * i;
				y = iy + (h + gap) * j;
				context.strokeStyle = 'white'
				context.beginPath();
				context.rect(x, y, w, h);
				context.stroke();
				context.strokeStyle = `rgb(${ri},${gi},${bi})`
				const noise = random.noise2D(i+1, j+1, frame * params.freq, params.amp)
				const r = Math.round((noise + 1) / 2)
				if (r === 1) {
					context.beginPath();
					context.rect(x + off / 2, y + off / 2, w - off, h - off);
					context.stroke();
				}
			}
		}
  };
};

const createPane = () => {
	const pane = new Pane()
	const noiseFolder = pane.addFolder({ title: 'Noise' })
	noiseFolder.addInput(params, 'freq', { min: 0, max: 0.01, step: 0.0001 })
	noiseFolder.addInput(params, 'amp', { min: 0.001, max: 100 })
	const colourFolder = pane.addFolder({ title: 'Colour' })
	colourFolder.addInput(params, 'innerColour', { label: 'Inner square colour' })
}

createPane()
canvasSketch(sketch, settings);
