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
  for (let i=0; i < 2; i++) {
    const x = random.range(0, width)
    const y = random.range(0, height)

    agents.push(new Agent(x, y))
  }

  return () => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const children = []

    for (let i=0; i < agents.length; i++) {
      const agent = agents[i]

      for (let j=i+1; j < agents.length; j++) {
        const other = agents[j]

        const dist = agent.pos.getDistance(other.pos)

        if (dist > 200) continue

        // if agent and other within 200 range
        if (agent.fertile && other.fertile) { // check if fertile
          const child = new Agent((agent.pos.x + other.pos.x)/2, (agent.pos.y + other.pos.y)/2) // create new agent midpoint between the 2
          children.push(child)

          // set cooldown on reproducing
          agent.fertile = false
          other.fertile = false
          setTimeout(() => { 
            agent.fertile = true
            other.fertile = true
          }, 5000)
        }

        context.lineWidth = math.mapRange(dist, 0, 200, 6, 1)

        context.beginPath()
        context.moveTo(agent.pos.x, agent.pos.y)
        context.lineTo(other.pos.x, other.pos.y)
        context.stroke()
      }
    }

    children.forEach(child => { // FIFO queue
      agents.push(child)
      if (agents.length > 20) agents.shift() // limits the agent population
    })

    agents.forEach(agent => { // for each agent on single frame
      agent.update() // each agents pos.x,pos.y position changes by vel.x,vel.y velocity
      agent.bounce(width, height) // inverts velocity if new point is out of bounds
      agent.draw(context) // redraws the point with updated pos.x,pos.y
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
    this.vel = new Vector(random.range(-1,1)*2, random.range(-1, 1)*2)
    this.radius = random.range(4, 12)
    this.fertile = true
  }

  bounce(width, height) {
    if (this.pos.x <= 0 || this.pos.x >= width) this.vel.x *= -1
    if (this.pos.y <= 0 || this.pos.y >= height) this.vel.y *= -1
  }

  update() {
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
  }

  draw(context) {
    context.save()
    context.translate(this.pos.x, this.pos.y)

    context.lineWidth = 4

    context.beginPath()
    context.arc(0, 0, this.radius, 0, Math.PI*2)
    context.fill()
    context.stroke()

    context.restore()
  }
}