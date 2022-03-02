const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {

  const cell = 10;
	const cols = Math.floor(width  / cell);
	const rows = Math.floor(height / cell);
	const numCells = cols * rows;

	typeCanvas.width  = cols;
	typeCanvas.height = rows;

  return () => {
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

		for (let i = 0; i < numCells; i++) {
			const col = i % cols;
			const row = Math.floor(i / cols);

			const x = col * cell;
			const y = row * cell;

			const r = typeData[i * 4 + 0];
			const g = typeData[i * 4 + 1];
			const b = typeData[i * 4 + 2];
      // const a = typeData[i * 4 + 3]

      context.fillStyle = `rgb(${r}, ${g}, ${b})` // colour each cell using typeData

			context.save();
			context.translate(x, y);
			context.translate(cell * 0.5, cell * 0.5); // translate to cell mid

      context.beginPath() // draw full circle
			context.arc(0, 0, cell/2, 0, 2*Math.PI);
      context.fill()

			context.restore();
    }
  };
};

canvasSketch(sketch, settings);
