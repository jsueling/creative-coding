const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ]
};

const sketch = () => {
  return ({ context, width, height }) => {
    // 8*8 grid, 9 gaps
    const w = width/9
    const h = height/9
    const g = width/9 - h*(8/9)
    const pi = Math.PI
    context.fillStyle = 'black'
    context.fillRect(0,0,width,height)
    context.strokeStyle = 'white'
    context.lineWidth = 3
    let x,y
    for (i = 0; i < 4; i++) { // top left quadrant
      for (j = 0; j < 4; j++) {
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
        if ((i-j) % 1 == 0) { // draws circles in all squares in this quadrant
          context.beginPath()
          context.fillStyle = 'white'
          context.arc(x+w/2,y+w/2,g*(i+1)*(j+1)/5,0,2*pi) // increasing radius in i and j
          context.fill()
        }
      }
    }
    for (i = 4; i < 8; i++) { // bot right
      for (j = 4; j < 8; j++) {
        x = w*i + (i+1)*g
        y = w*j + (j+1)*g
        context.beginPath()
        context.rect(x,y,w,h)
        context.stroke()
        if ((i+j) % 1 == 0) {
          context.beginPath()
          context.fillStyle = 'white'
          context.arc(x+w/2,y+w/2,g*(i-3)*(j-3)/5,0,2*pi)
          context.fill()
        }
      }
    }
    for (i = 4; i < 8; i++) { // top right
      for (j = 0; j < 4; j++) {
        x = w*i + (i+1)*g
        y = w*j + (j+1)*g
        context.beginPath()
        context.rect(x,y,w,h)
        context.stroke()
        if ((i+j) % 1 == 0) {
          context.beginPath()
          context.fillStyle = 'white'
          context.arc(x+w/2,y+w/2,g*(i-3)*(j+1)/5,0,2*pi)
          context.fill()
        }
      }
    }
    for (i = 0; i < 4; i++) { // bot left
      for (j = 4; j < 8; j++) {
        x = w*i + (i+1)*g
        y = w*j + (j+1)*g
        context.beginPath()
        context.rect(x,y,w,h)
        context.stroke()
        if ((i+j) % 1 == 0) {
          context.beginPath()
          context.fillStyle = 'white'
          context.arc(x+w/2,y+w/2,g*(i+1)*(j-3)/5,0,2*pi)
          context.fill()
        }
      }
    }
  };
};
canvasSketch(sketch, settings)