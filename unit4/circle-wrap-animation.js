const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

// https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
// implementation of animation
const animate = () => {
  console.log('domestika');
  requestAnimationFrame(animate)
}
// animate()

const sketch = ({ context, width, height }) => {

  // N.B. this is outside of the animation scope
  // 40 agents are created at random but fixed x,y (0,width||height)
  // with a random but fixed velocity between -1,1
  const agents = []
  const numAgents = 40
  const cx = width / 2
  const cy = height / 2
  for (let i=0; i < numAgents; i++) {
    const slice = math.degToRad(360/numAgents)
    const angle = slice*i
    const radius = width*0.3
    // const x = random.range(0, width)
    // const y = random.range(0, height)
    x = cx + radius * Math.sin(angle);
    y = cy + radius * Math.cos(angle);
    agents.push(new Agent(x, y))
  }

  return () => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    for (let i=0; i < agents.length; i++) {
      const agent = agents[i]

      for (let j=i+1; j < agents.length; j++) {
        const other = agents[j]

        const dist = agent.pos.getDistance(other.pos)

        if (dist > 100) continue

        context.lineWidth = math.mapRange(dist, 0, 100, 12, 1)

        context.beginPath()
        context.moveTo(agent.pos.x, agent.pos.y)
        context.lineTo(other.pos.x, other.pos.y)
        context.stroke()
      }
    }

    agents.forEach(agent => { // for each agent on single frame
      agent.update() // each agents pos.x,pos.y position changes by vel.x,vel.y velocity
      // agent.bounce(width, height) // inverts velocity if new point is out of bounds
      agent.wrap(width, height) // wraps when leaving the screen
      agent.draw(context, width, height) // redraws the point with updated pos.x,pos.y
    })
  };
};

canvasSketch(sketch, settings);

class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  
  getDistance(v) {
    const dx = this.x - v.x
    const dy = this.y - v.y
    return Math.sqrt(dx**2 + dy**2)
  }
}

class Agent {
  constructor(x, y) {
    this.pos = new Vector(x, y)
    this.vel = new Vector(random.range(-1,1), random.range(-1, 1))
    this.radius = random.range(4, 12)
  }

  bounce(width, height) {
    if (this.pos.x <= 0 || this.pos.x >= width) this.vel.x *= -1
    if (this.pos.y <= 0 || this.pos.y >= height) this.vel.y *= -1
  }

  update() {
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
  }

  wrap(width, height) {
    if (this.pos.x < 0) this.pos.x = width
    if (this.pos.x > width) this.pos.x = 0
    if (this.pos.y < 0) this.pos.y = height
    if (this.pos.y > height) this.pos.y = 0
  }

  draw(context) {
    context.save()
    context.translate(this.pos.x, this.pos.y)

    context.lineWidth = 2

    context.beginPath()
    context.arc(0, 0, this.radius, 0, Math.PI*2)
    context.fill()
    context.stroke()

    context.restore()
  }
}