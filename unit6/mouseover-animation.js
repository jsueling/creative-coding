const canvasSketch = require('canvas-sketch');
const random  = require('canvas-sketch-util/random')
const math  = require('canvas-sketch-util/math')

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

// Mouseover in canvas thanks to:
// https://stackoverflow.com/a/54805456
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d');

const sketch = ({ context, width, height, canvas }) => { // https://github.com/mattdesl/canvas-sketch/blob/master/docs/api.md#dom-props

  const agents = [];

  const cell = 100;
	const cols = Math.floor(width  / cell);
	const rows = Math.floor(height / cell);
	const numCells = cols * rows;

	typeCanvas.width  = cols;
	typeCanvas.height = rows;
	typeContext.fillStyle = 'white';
	typeContext.fillRect(0, 0, cols, rows);

  typeContext.save()
  typeContext.translate(cols/4, rows/4)
  typeContext.fillStyle = 'black'
  typeContext.fillRect(0, 0, cols/2, rows/2);
  typeContext.restore()

  const typeData = typeContext.getImageData(0, 0, cols, rows).data;

  for (let i = 0; i < numCells; i++) {
		const col = i % cols;
		const row = Math.floor(i / cols);

		const x = col * cell;
		const y = row * cell;

    const rgb = {
      r: typeData[i * 4 + 0],
      g: typeData[i * 4 + 1],
      b: typeData[i * 4 + 2]
      // a: typeData[i * 4 + 3] // alpha
    }

    if (rgb.r > 250) continue

		agents.push(new Agent(x, y, cell/2, cell/2, rgb))
	}

  let cursor = new Cursor(0, 0) // initialize cursor
  
  canvas.onmousemove = (e) => { // update cursor on canvas mouse move event
    cursor = new Cursor(e.offsetX, e.offsetY)
  }
  
  return () => {
    document.body.style.cursor = "default"; // each frame, set cursor style to default once
    agents.forEach(agent => {
      // agent.update();
			agent.draw(context);
      cursor.collisionCheck(context, agent)
		});
  };
};

canvasSketch(sketch, settings);

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	// getDistance(v) {
	// 	const dx = this.x - v.x;
	// 	const dy = this.y - v.y;
	// 	return Math.sqrt(dx * dx + dy * dy);
	// }
}

class Cursor extends Vector {
  constructor(x, y) {
    super(x, y);
  }

  collisionCheck(context, agent) {
    if (context.isPointInPath(agent.path, this.x, this.y)) {
      document.body.style.cursor = "pointer"
      agent.hovered = true
    } else {
      agent.hovered = false
    }
  }
}

class Agent {
	constructor(x, y, width, height, rgb) {
		this.pos = new Vector(x, y);
		// this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
    this.width = width
    this.height = height
    this.r = rgb.r
    this.g = rgb.g
    this.b = rgb.b
    this.hovered = false
    this.path = new Path2D() // https://developer.mozilla.org/en-US/docs/Web/API/Path2D
	}

	update() {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}

	draw(context) {
		context.save();
    context.fillStyle = this.hovered ? 'white' : `rgb(${this.r}, ${this.g}, ${this.b})` // conditionally change colour on hover
		this.path.rect(this.pos.x + this.width/2, this.pos.y + this.height/2, this.width, this.height);
    context.fill(this.path)
		context.restore();
	}
}