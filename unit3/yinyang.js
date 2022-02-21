const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 500, 500 ]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const pi = Math.PI
    const cx = width*0.5
    const cy = height*0.5
    const r = width*0.4
    context.lineWidth = 4

    // Big circle
    // 2 points equal below and above (radius of big circle)
    // from each point 1 small 1 medium circle
    
    // big circle black outline
    context.save()
    context.translate(cx,cy)
    context.beginPath()
    context.arc(0,0,r,0,2*pi)
    context.stroke()
    context.restore()
    
    // big half in black
    context.fillStyle = 'black';
    context.save()
    context.translate(cx,cy)
    context.rotate(pi/2)
    context.beginPath()
    context.arc(0,0,r,0,pi)
    context.fill()
    context.restore()

    // top med circle in white
    context.fillStyle = 'white'
    context.save()
    context.translate(cx,cy-r/2)
    context.beginPath()
    context.arc(0,0,r/2,0,2*pi)
    context.fill()
    context.restore()

    // bot med circle in black
    context.fillStyle = 'black';
    context.save()
    context.translate(cx,cy+r/2)
    context.beginPath()
    context.arc(0,0,r/2,0,2*pi)
    context.fill()
    context.restore()

    // top small circle in white
    context.fillStyle = 'black'
    context.save()
    context.translate(cx,cy-r/2)
    context.beginPath()
    context.arc(0,0,r/8,0,2*pi)
    context.fill()
    context.restore()

    // bot small circle in black
    context.fillStyle = 'white';
    context.save()
    context.translate(cx,cy+r/2)
    context.beginPath()
    context.arc(0,0,r/8,0,2*pi)
    context.fill()
    context.restore()
  };
};

canvasSketch(sketch, settings);
