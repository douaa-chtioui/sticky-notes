const path = require('path');

const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {

  socket.on('drawingUpdated', (data) => {
    socket.broadcast.emit('drawingUpdated', data);
  });
  socket.on('drawingCleared', () => {
    socket.broadcast.emit('drawingCleared');
  });
  socket.on('beginPath', () => {
    socket.broadcast.emit('beginPath');
  });

  socket.on('noteAdded', (data) => {
    socket.broadcast.emit('noteAdded', data);
  });
  socket.on('noteTitleUpdated', (data) => {
    socket.broadcast.emit('noteTitleUpdated', data);
  });
  socket.on('noteTextUpdated', (data) => {
    socket.broadcast.emit('noteTextUpdated', data);
  });
  socket.on('noteColorUpdated', (data) => {
    socket.broadcast.emit('noteColorUpdated', data);
  });
  socket.on('noteDeleted', (data) => {
    socket.broadcast.emit('noteDeleted', data);
  });
  socket.on('notesDeleted', () => {
    socket.broadcast.emit('notesDeleted');
  });

});


const PORT = 3010 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));