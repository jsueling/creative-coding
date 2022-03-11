const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ],
  // animate: true
};

let manager

let typedText = []
let word
let fontSize
let fontFamily = 'serif'
let timeoutID
let imageData

let mx
let my

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height }) => {

  const cell = 3;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);
  
  fontSize = width * 0.2
  typeFontSize = cols * 0.2

  typeCanvas.width  = cols;
  typeCanvas.height = rows;

  const numCells = cols * rows;
  
  return () => {

    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    
    context.fillStyle = 'white'
    context.font = `${fontSize}px ${fontFamily}`
    context.textBaseline = 'bot'
    context.textAlign = 'center'

    if (word) { // if completed word then we should replace the context with typeCanvas
      imageData = typeContext.getImageData(0, 0, cols, rows); // store typeCanvas image data
      for (let i = 0; i < numCells; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const x = col * cell
        const y = row * cell
        const r = imageData.data[i * 4 + 0] // 0123 4567 8.9.10.11
        const g = imageData.data[i * 4 + 1]
        const b = imageData.data[i * 4 + 2]

        if (r < 200) continue

        context.save()
        context.translate(width/2 + mx, height/2 + my)
        context.fillStyle = `rgb(${r}, ${g}, ${b})`
        context.fillRect(x, y, cell, cell)
        context.restore()
      }
    } else if (typedText.length) { // typedText but no word
      // first write on typeCanvas
      typeContext.fillStyle = 'white'
      typeContext.font = `${typeFontSize}px ${fontFamily}`
      typeContext.textBaseline = 'bot'
      typeContext.textAlign = 'center'
      
      // clean canvas
      typeContext.save()
      typeContext.fillStyle = 'black';
      typeContext.fillRect(0, 0, cols, rows);
      typeContext.restore()

      typeContext.save()
      typeContext.translate(cols/2, rows/2)
      typeContext.fillText(typedText.join(''), 0, 0)
      typeContext.restore()

      context.save()
      context.translate(width/2, height/2)
      context.fillText(typedText.join(''), 0, 0)
      context.restore()
    }
  };
};

/**
 * onKeyDown fills typedText array which is rendered to the screen immediately.
 * It is debounced so typedText gets copied into word and typedText gets cleared
 * only after inactivity. The word triggers the next animation
 */
const onKeyDown = (e) => {
  if (e.key == 'Backspace') { // backspace removes last char
    typedText.pop()
    fontSize /= 0.95
    typeFontSize /= 0.95
  } else if (e.key.length === 1) { // single keys only
    typedText.push(e.key)
    fontSize *= 0.95
    typeFontSize *= 0.95
  }
  manager.render()

  if (timeoutID) clearTimeout(timeoutID) // clears previous keyDown timeouts to clear text

  timeoutID = setTimeout(() => {
    word = [...typedText] // copy typedText
    typedText = []
    manager.render()
  }, 5000)
}

document.addEventListener('keydown', onKeyDown);

const start = async () => {
  manager = await canvasSketch(sketch, settings);
}

start()