const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');

const settings = {
  dimensions: [ 200, 200 ],
  animate: true,
  duration: 6
};

const sketch = () => {
  return ({ context, width, height, playhead }) => {
    const circleAnimation = playhead*30
		context.fillStyle = 'black';
		context.fillRect(0, 0, width, height);

		context.fillStyle = 'white';

		const cx = -width/2;
		const cy = -height/2;

		const w = width  * 0.006;
		const h = height * 1.4;
		let x, y;

		const num = 300;
		const radius = width/10;

		for (let i = 0; i < num; i++) {
			const slice = math.degToRad(360 / num);
			const angle = slice * i;

			x = cx + radius * Math.sin(angle)*circleAnimation;
			y = cy + radius * Math.cos(angle)*circleAnimation;

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
  };
};

canvasSketch(sketch, settings);
