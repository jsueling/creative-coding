const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 300, 300 ],
  animate: true, // https://github.com/mattdesl/canvas-sketch/blob/master/docs/animated-sketches.md
  duration: 1.6, // to change animation speed, change playhead and duration
};
// https://github.com/mattdesl/canvas-sketch/blob/master/docs/exporting-artwork.md*/
const sketch = () => {
  return ({ context, width, height, playhead }) => {
    const sequence = Math.round(playhead * 30) // playhead varies from 0..1 depending on fixed loop duration (in settings)
    const w = width/18
    const h = height/18
    const g = width/18 - h*(8/9)
    const pi = Math.PI
    context.fillStyle = 'black'
    context.fillRect(0,0,width,height)
    context.fillStyle = 'white' // white filled circles
    context.strokeStyle = 'white'
    context.lineWidth = 3
    let x,y
    for (i = 0; i < 8; i++) { // top left quadrant
      for (j = 0; j < 8; j++) {
        x = w*i + (i+1)*g
        y = w*j + (j+1)*g
        context.beginPath()
        context.rect(x,y,w,h)
        context.stroke()
        /**
         * can choose pattern of which circles drawn depending on i,j e.g.
         * if ((i-j) % 3 == 0 && i !== j)
         * if ((i+j) % 3 == 0)
         */
        if (i == 0 && j == 0) { // bug at 0,0
          if (sequence === 2) {
            context.beginPath()
            context.arc(x+w/2,y+w/2,g*2,0,2*pi)
            context.fill()
          }
        } else if (sequence !== 1 && (i+j) % sequence == 0) { // draws circles depending on: sequence 0,30 (rounded playhead 0..1 * 30) and position i,j
          context.beginPath()                                 // Top left and bot right only draw circles when i+j % sequence == 0
          context.arc(x+w/2,y+w/2,g*2,0,2*pi)
          context.fill()
        }
      }
    }
    for (i = 8; i < 16; i++) { // bot right
      for (j = 8; j < 16; j++) {
        x = w*i + (i+1)*g
        y = w*j + (j+1)*g
        context.beginPath()
        context.rect(x,y,w,h)
        context.stroke()
        if (sequence !== 1 && (i+j) % sequence == 0) {
          context.beginPath()
          context.arc(x+w/2,y+w/2,g*2,0,2*pi)
          context.fill()
        }
      }
    }
    for (i = 8; i < 16; i++) { // top right
      for (j = 0; j < 8; j++) {
        x = w*i + (i+1)*g
        y = w*j + (j+1)*g
        context.beginPath()
        context.rect(x,y,w,h)
        context.stroke()
        if ((i+j) % sequence > 0) { // fills square with circle unless (i+j) % sequence == 0, thus not drawing a circle
          context.beginPath()
          context.fillStyle = 'white'
          context.arc(x+w/2,y+w/2,g*2,0,2*pi)
          context.fill()
        }
      }
    }
    for (i = 0; i < 8; i++) { // bot left
      for (j = 8; j < 16; j++) {
        x = w*i + (i+1)*g
        y = w*j + (j+1)*g
        context.beginPath()
        context.rect(x,y,w,h)
        context.stroke()
        if ((i+j) % sequence > 0) { // same above
          context.beginPath()
          context.fillStyle = 'white'
          context.arc(x+w/2,y+w/2,g*2,0,2*pi)
          context.fill()
        }
      }
    }
  };
};
canvasSketch(sketch, settings)