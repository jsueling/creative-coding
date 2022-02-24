const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const Tweakpane = require('tweakpane')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const params = {
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 30,
  freq: 0.001,
  amp: 0.2,
  animate: true,
  frame: 0,
  lineCap: 'butt',
}

const sketch = () => {
  return ({ context, width, height, frame }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const cols = params.cols
    const rows = params.rows
    const numCells = cols * rows

    const gridw = width * 0.8
    const gridh = height * 0.8
    const cellw = gridw / cols
    const cellh = gridh / rows
    const margx = (width - gridw) * 0.5
    const margy = (height - gridh) * 0.5
    
    for (let i=0; i < numCells; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)

      const x = col * cellw
      const y = row * cellh
      const w = cellw * 0.8
      const h = cellh * 0.8

      const f = params.animate ? frame : params.frame

      // https://github.com/mattdesl/canvas-sketch-util/blob/master/docs/random.md#n--randomnoise2dx-y-frequency--1-amplitude--1
      // simplex noise, controlled randomness (grouping)
      // const n = random.noise2D(x + frame * 10, y, params.freq) // assings noise n -1, 1 based on x, y
      // we specify frequency 0.001 to get 0.1% of the effect
      const n = random.noise3D(x , y, f * 10, params.freq)

      // const scale = (n * 0.5 + 0.5) * 30 // mapping -1, 1 to 0, 1
      const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax)

      const angle = n * Math.PI * params.amp

      context.save()
      // translate context to the centre of each grid cell to draw
      // factoring in margin
      context.translate(x + margx + cellw * 0.5, y + margy + cellh * 0.5)
      context.rotate(angle)
      context.lineWidth = scale
      context.lineCap = params.lineCap

      context.beginPath()
      // draws an equal line across the origin
      context.moveTo(w * -0.5, 0)
      context.lineTo(w * 0.5, 0)
      context.stroke()
      context.restore()
    }
  };
};

const createPane = () => {
  const pane = new Tweakpane.Pane()
  let folder

  folder = pane.addFolder({ title: 'Grid' })
  folder.addInput(params, 'lineCap', { options: { butt: 'butt', round: 'round', square: 'square '} })
  folder.addInput(params, 'cols', { min: 2, max: 50, step: 1 })
  folder.addInput(params, 'rows', { min: 2, max: 50, step: 1 })
  folder.addInput(params, 'scaleMin', { min: 1, max: 100 })
  folder.addInput(params, 'scaleMax', { min: 1, max: 100 })

  folder = pane.addFolder({ title: 'Noise' })
  folder.addInput(params, 'freq', { min: -0.01, max: 0.01 })
  folder.addInput(params, 'amp', { min: 0, max: 1 })
  folder.addInput(params, 'animate')
  folder.addInput(params, 'frame', { min: 0, max: 999, step: 1 })
}

createPane()
canvasSketch(sketch, settings);
