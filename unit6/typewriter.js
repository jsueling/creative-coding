const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

let manager

let text = []
let fontSize = 200
let fontFamily = 'serif'
let timeoutID

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'black'
    context.font = `${fontSize}px ${fontFamily}` // fontSize + 'px' + fontFamily
    context.textBaseline = 'bot'
    context.textAlign = 'center'

    const metrics = context.measureText(text)
    const mx = metrics.actualBoundingBoxLeft * -1
    const my = metrics.actualBoundingBoxAscent * -1
    const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight
    const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

    const x = (width - mw) * 0.5 - mx
    const y = (height - mh) * 0.5 - my

    console.log(mx, my);
    context.save()
    context.translate(width/2, height/2)  //x, y)

    context.lineWidth = 5
    context.beginPath()
    context.rect(mx, my, mw, mh)
    context.stroke()

    context.fillText(text.join(''), 0, 0)
    context.restore()
  };
};

const onKeyUp = (e) => {
  if (e.key == 'Backspace') text.pop()
  // else if (e.key == 'Enter') text.push('\n')
  else if (e.key.length === 1) text.push(e.key)
  manager.render()

  if (timeoutID) clearTimeout(timeoutID) // clears previous keyUp timeouts to clear text

  timeoutID = setTimeout(() => { // in 3 seconds, clears text and rerenders
    text = []
    manager.render()
  }, 2000)
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