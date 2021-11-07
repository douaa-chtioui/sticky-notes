import * as canvas from './modules/canvas.mjs';
import * as notes from './modules/notes.mjs';

const socket = io();

socket.on('noteAdded', (data) => notes.add(data.id));
socket.on('noteTitleUpdated', (data) => notes.updateTitle(data.id, data.title));
socket.on('noteTextUpdated', (data) => notes.updateText(data.id, data.text));
socket.on('noteColorUpdated', (data) => notes.changeColor(data.id, data.color));
socket.on('noteDeleted', (data) => notes._delete(data.id, false));
socket.on('notesDeleted', () => notes.deleteAll(false));

socket.on('drawingUpdated', (data) => canvas.drawLine(data.lastX, data.lastY, data.currentX, data.currentY, data.color));
socket.on('drawingCleared', () => canvas.clear(false));
socket.on('beginPath', () => canvas.beginPath());

notes.on('noteAdded', (data) => socket.emit('noteAdded', data));
notes.on('noteTitleUpdated', (data) => socket.emit('noteTitleUpdated', data));
notes.on('noteTextUpdated', (data) => socket.emit('noteTextUpdated', data));
notes.on('noteColorUpdated', (data) => socket.emit('noteColorUpdated', data));
notes.on('noteDeleted', (data) => socket.emit('noteDeleted', data));
notes.on('notesDeleted', () => socket.emit('notesDeleted'));

canvas.on('drawingUpdated', (data) => socket.emit('drawingUpdated', data));
canvas.on('drawingCleared', () => socket.emit('drawingCleared'));
canvas.on('beginPath', () => socket.emit('beginPath'));

document.onmousedown = notes.clearMenus; //Clear menus when the mouse is clicked to the side

document.getElementById('add-note-btn').onclick = notes.create;
document.getElementById('delete-notes-btn').onclick = notes.deleteAll;
document.getElementById('draw-btn').onclick = () => {
  notes.clearMenus();
  canvas.changeColor('#000');
}
document.getElementById('erase-btn').onclick = () => canvas.changeColor('#d3d3d3');
document.getElementById('clear-btn').onclick = canvas.clear;

/**
 * displayImage uploads a new image and Embad it.
 * @param file
 */
function displayImage(file) {
  let reader = new FileReader();
  reader.onload = () => {
    let img = document.createElement('img');
    img.src = reader.result;
    document.body.appendChild(img);
  };
  reader.readAsDataURL(file);
}

document.getElementById('image_input').onchange = (e) => displayImage(e.target.files[0]);