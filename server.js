const path = require('path');

const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
	socket.broadcast.emit('test', 'testing if work');
	socket.on('drawClick', (data) =>{
		console.log(data);
		//io.emit('draw', {event : data.event,lX : data.x, lY : data.y, cX : data.currentX, cY : data.currentY, color: data.color});
		io.emit('draw', data);
		//socket.emit('draw', data);
	});

	socket.on('addNote', (note) =>{
		console.log(note);
		socket.broadcast.emit('noteAdded', {id : note.id});
		console.log('emited');
	});
	
	
});


const PORT = 3010 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));