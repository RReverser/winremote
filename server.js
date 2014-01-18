var config = require('./config.js'),
    io = require('socket.io').listen(config.port, config.socketio),
    server,
    child = require('child_process'),
    FacebookClient = require("facebook-client").FacebookClient,
    fs = require('fs'),
    simulator = require('./simulator.js');

io.sockets.on('connection', function (socket) {
    if (socket.handshake.address.address != '127.0.0.1') return;
    
    (server = socket).on('screen', function(data) {
        io.of('/client').emit('screen', data);
    });
});

var cmd = child.spawn('cmd.exe');

cmd.stdout.on('data', function (data) {
    io.of('/client').emit('cmd', data.toString());
});

function sendFileList(socket) {
    fs.readdir('.', function(err, list) {
        list.unshift(process.cwd());
        socket.emit('files.list', list.map(function(item) { return {isDir: fs.statSync(item).isDirectory(), name: item} }));
    });
}

io.of('/client').on('connection', function (socket) {
    socket
    .on('auth', function(access_token) {
        try {
            // TODO: auth here
            socket.emit('auth', true);
        } catch(e) {}
    })
    .on('mouse', function(data) { 
        if (server) server.emit('mouse', data);
    })
    .on('keyboard', function(data) {
        if (server) server.emit('keyboard', data);
    })
    .on('cmd', function(data) {
        cmd.stdin.write(data + "\n");
    })
    .on('files.list', function() {
        sendFileList(socket);
    })
    .on('files.chdir', function(dir) {
        process.chdir(dir);
        sendFileList(socket);
    });
    /*
    .on('files.get', function(name) {
        try {
            
            process.chdir(dir);
        } catch(e) {};
    });*/
});

child.spawn('server_control/TestProject.exe');