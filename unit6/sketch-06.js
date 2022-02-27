const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')

const settings = {
  dimensions: [ 1080, 1080 ]
};

let manager

let text = 'A' // []
let fontSize = 1200
let fontFamily = 'serif'
// let timeoutID

const typeCanvas = document.createElement('canvas')
const typeContext = typeCanvas.getContext('2d')

const sketch = ({ context, width, height }) => {
  const cell = 20
  const cols = Math.floor(width / cell)
  const rows = Math.floor(height / cell)
  const numCells = cols * rows

  typeCanvas.width = cols
  typeCanvas.height = rows

  return () => { // render function
    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, width, height);

    fontSize = cols * 1.2

    typeContext.fillStyle = 'white'
    typeContext.font = `${fontSize}px ${fontFamily}` // fontSize + 'px' + fontFamily
    typeContext.textBaseline = 'top'

    const metrics = typeContext.measureText(text)
    const mx = metrics.actualBoundingBoxLeft * -1 // range <= 0
    const my = metrics.actualBoundingBoxAscent * -1 // range <= 0
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

    // get the top left of bounding box mapped to centred image
    const tx = (cols - mw) * 0.5 - mx
    const ty = (rows - mh) * 0.5 - my

    typeContext.save()
    typeContext.translate(tx, ty)

    typeContext.lineWidth = 5
    // typeContext.beginPath()
    // typeContext.strokeStyle = 'white'
    // typeContext.rect(mx, my, mw, mh)
    // typeContext.stroke()

    typeContext.fillText(text, 0, 0) // (text.join(''), 0, 0)
    typeContext.restore()

    const typeData = typeContext.getImageData(0, 0, cols, rows).data

    context.drawImage(typeCanvas, 0, 0)

    context.fillStyle = 'black'

    context.textBaseline = 'middle'
    context.textAlign = 'center'

    context.fillRect(0,0,width,height)

    for (let i = 0; i < numCells; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)

      const x = col * cell
      const y = row * cell

      const r = typeData[i * 4 + 0]
      const g = typeData[i * 4 + 1]
      const b = typeData[i * 4 + 2]
      // const a = typeData[i * 4 + 3]

      const glyph = getGlyph(r) // only need to pass r for alternating between black and white

      context.font = `${cell * 2}px ${fontFamily}`
      if (Math.random() < 0.1) context.font = `${cell * 6}px ${fontFamily}`

      context.fillStyle = 'white'

      context.save()
      context.translate(x, y)
      context.translate(cell*0.5, cell*0.5)

      // squares
      // context.fillRect(0, 0, cell, cell)

      // circles
      // context.beginPath()
      // context.arc(0,0,cell*0.5,0,Math.PI*2)
      // context.fill()

      context.fillText(glyph, 0, 0)

      context.restore()
    }
  };
};

const getGlyph = (v) => { // v 0-255
  if (v < 50) return ''
  if (v < 100) return '.'
  if (v < 150) return '-'
  if (v < 200) return '+'

  const glyphs = '_= /'.split('')

  return random.pick(glyphs)
}

const onKeyUp = (e) => {
  text = e.key.toUpperCase()
  // if (e.key == 'Backspace') text.pop()
  // else if (e.key.length === 1) text.push(e.key)
  manager.render()

  // if (timeoutID) clearTimeout(timeoutID) // clears previous keyUp timeouts to clear text

  // timeoutID = setTimeout(() => { // in 3 seconds, clears text and rerenders
  //   text = []
  //   manager.render()
  // }, 3000)
}

document.addEventListener('keyup', onKeyUp);

const start = async () => {
  manager = await canvasSketch(sketch, settings);
}

start()

// const url = 'https://picsum.photos/200'

// const loadMeSomeImage = (url) => {
//   return new Promise((res, rej) => {
//     const img = new Image()
//     img.onload = () => res(img)
//     img.onerror = () => rej()
//     img.src = url
//   })
// }

// const start = () => {
//   loadMeSomeImage(url).then(img => {
//     console.log('image width', img.width);
//   })
//   console.log('this line');
// }

// const start = async () => {
//   const img = await loadMeSomeImage(url)
//   console.log('image width', img.width)
//   console.log('this line')
// }

// start()