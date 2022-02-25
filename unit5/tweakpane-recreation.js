const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const Tweakpane = require('tweakpane')

const settings = {
  dimensions: [ 2048, 2048 ],
  animate: true
};

const params = {
  cols: 50,
  rows: 50,
  freq: 0.0017,
  amp: 1,
  radius: 20,
  backgroundCol: { r: 0, g: 0, b: 0 },
  foregroundCol: { r: 255, g: 255, b: 255 }
}

// trying to recreate: https://cocopon.github.io/tweakpane/

const sketch = () => {
  return ({ context, width, height, frame }) => {
    const { r: r_bg, g: g_bg, b: b_bg } = params.backgroundCol
    const { r: r_fg, g: g_fg, b: b_fg } = params.foregroundCol
    context.fillStyle = `rgb(${r_bg},${g_bg},${b_bg})`
    context.fillRect(0, 0, width, height);
    context.fillStyle = `rgb(${r_fg},${g_fg},${b_fg})`

    const cols = params.cols // control
    const rows = params.rows // control
    const numCells = cols * rows
    const radius = params.radius // control
    
    // o o o
    // -----
    // |   |
    // remaining space from width - ((circles in row - 1) * circle diameters), divide that by number of circles - 1
    // when we have 2 circles at each corner already

    const margx = (width - (2 * radius * (cols - 1))) / (cols - 1)
    const margy = (height - (2 * radius * (rows - 1))) / (rows - 1)

    for (let i=0; i < numCells; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)

      const x = col * (2 * radius + margx)
      const y = row * (2 * radius + margy)

      const n = random.noise2D(x, y, frame * params.freq/3000, params.amp) // -1, 1
      const scale = math.mapRange(n, -1, 1, -radius, radius)

      context.save()
      context.translate(x, y)
      context.beginPath()
      context.arc(0, 0, scale + radius, 0, 2 * Math.PI)
      context.fill()
      context.restore()
    }
  };
};

const createPane = () => {
  const pane = new Tweakpane.Pane()

  const gridFolder = pane.addFolder({ title: 'Grid' })
  gridFolder.addInput(params, 'cols', { min: 2, max: 100, step: 1 })
  gridFolder.addInput(params, 'rows', { min: 2, max: 100, step: 1 })
  gridFolder.addInput(params, 'radius', { min: 1, max: 50 })

  const noiseFolder = pane.addFolder({ title: 'Noise' })
  noiseFolder.addInput(params, 'freq', { min: -0.01, max: 0.01, step: 0.0001 })
  noiseFolder.addInput(params, 'amp', { min: 0, max: 1 })

  const colourFolder = pane.addFolder({ title: 'Colour' })
  colourFolder.addInput(params, 'backgroundCol', {
    picker: 'inline',
    expanded: true,
  });
  colourFolder.addInput(params, 'foregroundCol', {
    picker: 'inline',
    expanded: true,
  });
}

createPane()
canvasSketch(sketch, settings);
