const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const { Pane } = require('tweakpane')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const params = {
  glyphs: '.:_°-',
  speed: 600,
  freq: 2,
  text: 'A'
}

let manager

let text
let fontSize = 1200
let fontFamily = 'serif'

const typeCanvas = document.createElement('canvas')
const typeContext = typeCanvas.getContext('2d')

const sketch = ({ context, width, height }) => {
  const cell = 20
  const cols = Math.floor(width / cell)
  const rows = Math.floor(height / cell)
  const numCells = cols * rows

  typeCanvas.width = cols
  typeCanvas.height = rows

  return ({ time }) => { // render function
    typeContext.fillStyle = 'black';
    typeContext.fillRect(0, 0, width, height);
    text = params.text // always update text to be the input parameter
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

      const glyph = getGlyph(r, time) // only need to pass r for alternating between black and white, also time

      context.font = `${cell * 2}px ${fontFamily}`

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

const createPane = () => {
  const pane = new Pane()
  pane.addInput(params, 'glyphs')
  pane.addInput(params, 'speed', { min: 1, max: 1000, step: 1 })
  pane.addInput(params, 'freq', { min: 0.1, max: 100, step: 0.1 })
  pane.addInput(params, 'text').on('change', changeText)
}

const changeText = (e) => {
  params.text = e.value
  manager.render()
}

const getGlyph = (v, time) => { // v 0-255
  // if (v < 50) return ''

  // .:_°- good combination of glyphs

  const playhead = time / params.speed % 1

  // const wrapPlayhead = Math.sin(playhead * Math.PI)

  const glyphs = params.glyphs.split('')

  const noise = random.noise1D(v * playhead, params.freq, 1) // pass in v 0-255 * playhead so varies with time, returns noise -1 through 1
  const i = Math.round(math.mapRange(noise, -1, 1, 0, (glyphs.length - 1))) // maps to rounded index of the glyphs array

  return glyphs[i]
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

createPane()

// document.addEventListener('keyup', onKeyUp);

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