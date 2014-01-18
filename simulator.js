var mouse = require('./InputSimulator.js').Mouse,
	io = require('socket.io').listen(80);

io.sockets.on('connection', function (socket) {
	socket.on('move', function (data) {
		Mouse(data);
	});
});