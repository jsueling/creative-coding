const canvasSketch = require('canvas-sketch');
const { Pane } = require('tweakpane')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
};

const params = {
  pixels: 540,
  speed: 1
}

let manager // sketchManager https://github.com/mattdesl/canvas-sketch/blob/master/docs/api.md#sketchmanager

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {

  const img = new Image()
  img.src = 'coke-logo.png' // local image

  // const fontSize = 30; // font settings
  // const fontFamily = 'serif';
  // context.textBaseline = 'middle';
  // context.textAlign = 'center';
  // context.font = `${fontSize}px ${fontFamily}`;

  return ({ time }) => {

    // const wrapPlayhead = Math.sin(playhead * Math.PI) // 0 -> 0.99 -> 0, ... https://github.com/mattdesl/canvas-sketch/blob/master/docs/animated-sketches.md
 
    // implementation of playhead
    const playhead = time / params.speed % 1 // 0 -> 1, 0 -> 1, ...

    context.fillStyle = 'white'; // clear previous renders
    context.fillRect(0, 0, width, height);

    const cell = params.pixels
    const cols = Math.floor(width / cell)
    const rows = Math.floor(height / cell)
    const numCells = cols * rows;
  
    typeCanvas.width  = cols; // shrink typeCanvas
    typeCanvas.height = rows;

    typeContext.fillStyle = 'white'; // drawing in typeContext
    typeContext.fillRect(0, 0, width, height); // white background

    typeContext.drawImage(img, 0, 0, rows, cols) // coke logo
    const typeData = typeContext.getImageData(0, 0, rows, cols).data // extract pixel data
    // console.log(typeData);

    for (let i = 0; i < numCells; i++) {

      const col = i % cols
      const row = Math.floor(i / cols)

      const x = col * cell // get x,y from row,col * cell size
      const y = row * cell

      // bug, i at end of col gets rgb from start of next row
      // resulting in upward animation
      // intention is for a continuous loop isolated to a row

      let r_index = i * 4 + 0
      let g_index = i * 4 + 1
      let b_index = i * 4 + 2

      /*
      |  r  1  2  3 |  4  5  6  7 |  8  9 10 11 | 12 13 14 15 | 16 17 18 19 | 20 21 22 23 | 24 25 26 27 | 28 29 30 31 |
      | 32 33 34 35 | 36 37 38 39 | 40 41 42 43 | 44 45 46 47 | 48 49 50 51 | 52 53 54 55 | 56 57 58 59 | 60 61 62 63 |
      */
      let colourTransition = Math.round((cols-1) * playhead) * 4 // varies from 0 to cols-1 infront, multiply by 4 to get the r 4,8,12 in front

      // colourTransition % (cols * 4) + position at beginning of row
      const beginRow = row * cols * 4

      let r = typeData[(r_index + colourTransition) % (cols * 4) + beginRow];
			let g = typeData[(b_index + colourTransition) % (cols * 4) + beginRow];
			let b = typeData[(g_index + colourTransition) % (cols * 4) + beginRow];
			// let a = typeData[i * 4 + 3];

      context.fillStyle = 'white' //`rgb(${r},${g},${b})`
      context.save()

      context.translate(x, y) // translate context to top-left corner
      // context.translate(cell * 0.5, cell * 0.5) // then to mid

      // context.fillText(getGlyph(i % 9), 0, 0); // mid centered glyph

      // context.beginPath() // mid centered circles
      // context.arc(0,0,cell/2,0,2*Math.PI)
      // context.fill()

      // context.translate(-cell * 0.25, -cell * 0.25) // white centered square pixels
      // context.fillStyle = `rgb(${255},${255},${255})`
      // context.fillRect(0, 0, cell/2,cell/2)

      context.fillRect(0, 0, cell, cell) // pixelated squares

      // diamond
      context.fillStyle = `rgb(${r},${g},${b})` // 'white' 
      context.beginPath()
      context.moveTo(0, 0)
      context.lineTo(0, cell)
      context.lineTo(cell/2, cell)
      context.fill()
      context.beginPath()
      context.moveTo(cell, cell)
      context.lineTo(cell, 0)
      context.lineTo(cell/2, cell)
      context.fill()
      context.beginPath()
      context.moveTo(cell, 0)
      context.lineTo(cell/2, 0)
      context.lineTo(cell, cell)
      context.fill()
      context.beginPath()
      context.moveTo(0, 0)
      context.lineTo(cell/2, 0)
      context.lineTo(0, cell)
      context.fill()

      context.restore()
    }
  };
};

const createPane = () => {
  const pane = new Pane()
  pane.addInput(params, 'pixels', { min: 5, max: 540, step: 1 }) // .on('change', (() => manager.render())) // rerender on slider
  pane.addInput(params, 'speed', { min: 0.1, max: 20, step: 0.1 })
}

const getGlyph = (i) => {
  const cokeArray = ["C", "o", "c", "a", "-", "C", "o", "l", "a"] // length 9, i % 9 -> 0-8
  return cokeArray[i]
}

createPane() // create Tweakpane pane

const start = async () => {
	manager = await canvasSketch(sketch, settings);
};

start();