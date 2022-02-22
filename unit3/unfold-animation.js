const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 500, 500 ],
  animate: true,
  duration: 8
};


const sketch = () => {
  return ({ context, width, height, playhead }) => {
		const playheadFactor = 2
		const radiusFactor = 0.5
    const circleAnimation = playhead*playheadFactor
		// TODO add color
		context.fillStyle = 'white';
		context.fillRect(0, 0, width, height);

		context.fillStyle = 'black';

		const cx = width  * 0.5;
		const cy = height * 0.5;

		const w = width  * 0.01;
		const h = height * 0.1;
		let x, y;

		const num = 40;
		let radius = circleAnimation < playheadFactor/2 ? width * radiusFactor * (0.5**(circleAnimation)) : width * radiusFactor * (0.5**(playheadFactor-circleAnimation));
		if (circleAnimation < 1) {
			for (let i = 0; i < num; i++) {
				const slice = math.degToRad(360 / num);
				const angle = slice * i;
	
				x = cx + radius * Math.sin(angle*circleAnimation);
				y = cy + radius * Math.cos(angle*circleAnimation);
	
				context.save();
				context.translate(x, y);
				context.rotate(-angle);
				context.beginPath();
				context.rect(-w * 0.5, -h * 0.5, w, h);
				context.fill();
				context.restore();
	
				context.save();
				context.translate(cx, cy);
				context.rotate(-angle);
	
				context.lineWidth = 10
	
				context.restore();
			}
		} else {
			for (let i = 0; i < num; i++) {
				radius = width * radiusFactor/2
				const slice = math.degToRad(360 / num);
				const angle = slice * i;
	
				x = cx + radius * Math.sin(angle);
				y = cy + radius * Math.cos(angle);
	
				context.save();
				context.translate(x, y);
				context.rotate(-angle);
				context.beginPath();
				context.rect(-w * 0.5, -h * 0.5, w, h);
				context.fill();
				context.restore();
	
				context.save();
				context.translate(cx, cy);
				context.rotate(-angle);
	
				context.lineWidth = 10
	
				context.restore();
			}
		}

  };
};

canvasSketch(sketch, settings);