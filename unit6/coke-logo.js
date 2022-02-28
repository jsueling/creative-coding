const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {

  const img = new Image()
  img.src = 'coke-logo.png' // local image

  const cell = 40
  const cols = Math.floor(width / cell)
  const rows = Math.floor(height / cell)
  const numCells = cols * rows;

  typeCanvas.width  = cols; // shrink typeCanvas
	typeCanvas.height = rows;

  // let fontSize = 30;
  // let fontFamily = 'serif';

  return () => {
    typeContext.fillStyle = 'white'; // drawing in typeContext
    typeContext.fillRect(0, 0, width, height); // white background

    typeContext.drawImage(img, 0, 0, rows, cols) // coke logo
    const typeData = typeContext.getImageData(0, 0, rows, cols).data // extract pixel data
    // console.log(typeData);

		// context.textBaseline = 'middle'; // font settings
		// context.textAlign = 'center';
    // context.font = `${fontSize}px ${fontFamily}`;

    for (let i = 0; i < numCells; i++) {

      const col = i % cols
      const row = Math.floor(i / cols)

      const x = col * cell // get x,y from row,col * cell size
      const y = row * cell

      let r = typeData[i * 4 + 0];
			let g = typeData[i * 4 + 1];
			let b = typeData[i * 4 + 2];
			// let a = typeData[i * 4 + 3];

      context.fillStyle = `rgb(${r},${g},${b})`
      context.save()

      context.translate(x, y) // translate context to top-left corner
      context.translate(cell * 0.5, cell * 0.5) // then to mid

      // context.fillText(getGlyph(i % 9), 0, 0); // mid centered glyph

      // context.beginPath() // mid centered circles
      // context.arc(0,0,cell/2,0,2*Math.PI)
      // context.fill()

      // context.translate(-cell * 0.25, -cell * 0.25) // white centered square pixels
      // context.fillStyle = `rgb(${255},${255},${255})`
      // context.fillRect(0, 0, cell/2,cell/2)

      context.fillRect(0, 0, cell, cell) // pixelated squares

      context.restore()
    }
  };
};

const getGlyph = (i) => {
  const cokeArray = ["C", "o", "c", "a", "-", "C", "o", "l", "a"] // length 9, i % 9 0-8
  return cokeArray[i]
}

canvasSketch(sketch, settings);
