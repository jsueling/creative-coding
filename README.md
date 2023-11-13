## My code repository for [Creative Coding: Making Visuals with JavaScript](https://www.domestika.org/en/courses/2729-creative-coding-making-visuals-with-javascript/course)
Animations made in the browser using JavaScript with [canvas-sketch](https://github.com/mattdesl/canvas-sketch) and [Tweakpane](https://cocopon.github.io/tweakpane/)
<hr>
<div align="center">
  <img src="https://github.com/jsueling/creative-coding/assets/64977718/0ae89d86-c15e-4478-b817-53d450a7dadf">  
  <p align='left'>This animation uses the keydown event and setTimeouts to debounce the text input and then finally extracts the image data. For each white pixel, an agent is created which collides with others and has gravity. The implementation of gravity and collision detection/resolution is from
    <a href='https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics'>this</a> useful guide. The code can be found
    <a href='https://github.com/jamessl154/creative-coding/blob/main/unit6/typewriter.js?ts=2'>here</a>.</p>
</div>
<hr>
<div align="center">
  <img src="https://github.com/jsueling/creative-coding/assets/64977718/3cd711bd-83bf-47ac-a5ed-cddcc10827ec">
  <p align='left'>After extracting the pixel data of the logo, this animation draws a diamond for each pixel using the RGB data from a pixel to the right of it in it's row depending on the time of the current animation loop and wrapping to the start of the same row if necessary. This is why it appears shifting to the left always. I also used Tweakpane to control the animation speed and pixel density of the image. The code can be found <a href='https://github.com/jsueling/creative-coding/blob/main/unit6/coke-logo.js'>here</a>.</p>
</div>
<hr>

## [Final Project](https://www.domestika.org/en/projects/1404602-final-project)
