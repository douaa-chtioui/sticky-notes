const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

let lastX;
let lastY;
let currentX;
let currentY;
let drawing = false;
let color = "#000";

const listeners = new Map();

/**
 * on adds add elements to listeners.
 * @param event
 * @param callback
 */
function on(event, callback) {
  listeners.set(event, callback);
}

ctx.lineWidth = 5;
canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stop);

/**
 * start starts drawing and informs other clients.
 * @param event  mousedown event
 */
function start(event) {
  drawing = true;
  if (event.offsetX !== undefined) {
    lastX = event.offsetX;
    lastY = event.offsetY;
  } else {
    lastX = event.layerX - event.currentTarget.offsetLeft;
    lastY = event.layerY - event.currentTarget.offsetTop;
  }
  ctx.beginPath();
  listeners.get('beginPath')?.();
}

/**
 * beginPath begins a new path.
 */
function beginPath() {
  ctx.beginPath();
}

/**
 * stop stops the drawing.
 */
function stop() {
  drawing = false;
}

/**
 * draw draws into canvas.
 * @param event  mousemove event
 */
function draw(event) {
  if (drawing) {
    // get current mouse position
    if (event.offsetX !== undefined) {
      currentX = event.offsetX;
      currentY = event.offsetY;
    } else {
      currentX = event.layerX - event.currentTarget.offsetLeft;
      currentY = event.layerY - event.currentTarget.offsetTop;
    }
    drawLine(lastX, lastY, currentX, currentY, color);
    listeners.get('drawingUpdated')?.({ lastX, lastY, currentX, currentY, color });
    // set current coordinates to last one
    lastX = currentX;
    lastY = currentY;
  }

}

/**
 * drawLine draws from last positions to new positions.
 * @param lX
 * @param lY
 * @param cX
 * @param cy
 * @param c
 */
function drawLine(lX, lY, cX, cY, c) {
  ctx.strokeStyle = c;
  ctx.lineWidth = 5;
  ctx.moveTo(lX, lY);
  ctx.lineTo(cX, cY);

  ctx.stroke();
}

/**
 * changeColor changes the color of drawing.
 * @param newColor
 */
function changeColor(newColor) {
  color = newColor;
}

/**
 * clear erases all the existing drawing.
 * @param notify
 */
function clear(notify = true) {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  if (notify) {
    listeners.get('drawingCleared')?.();
  }
}

export { clear, changeColor, drawLine, on, beginPath };
