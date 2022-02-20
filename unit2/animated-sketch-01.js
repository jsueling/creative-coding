const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true, // https://github.com/mattdesl/canvas-sketch/blob/master/docs/animated-sketches.md
  duration: 6, // to change animation speed, change playhead and duration
};
// https://github.com/mattdesl/canvas-sketch/blob/master/docs/exporting-artwork.md*/
const sketch = () => {
  return ({ context, width, height, playhead }) => {
    const sequence = Math.round(playhead * 30)
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
        if (i == 0 && j == 0) {
          if (sequence === 2) {
            context.beginPath()
            context.arc(x+w/2,y+w/2,g*4,0,2*pi)
            context.fill()
          }
        } else if (sequence !== 1 && (i+j) % sequence == 0) { // draws circles in all squares in this quadrant
          context.beginPath()
          context.arc(x+w/2,y+w/2,g*4,0,2*pi)
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
          context.arc(x+w/2,y+w/2,g*4,0,2*pi)
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
        if ((i+j) % sequence > 0) { // fills with circle unless (i+j) equals sequence, thus not drawing a circle
          context.beginPath()
          context.fillStyle = 'white'
          context.arc(x+w/2,y+w/2,g*4,0,2*pi)
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
          context.arc(x+w/2,y+w/2,g*4,0,2*pi)
          context.fill()
        }
      }
    }
  };
};
canvasSketch(sketch, settings)