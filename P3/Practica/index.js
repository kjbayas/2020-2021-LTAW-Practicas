const path = require('path');
const express = require('express');
const app = express();

app.set('port', process.env.Port || 8080);

//-- Archivos estaticos 
console.log();
app.use(express.static(path.join(__dirname, 'public')));

// -- Iniciando el servidor
const server = app.listen(app.get('port'), () =>{
    console.log('server on port', app.get ('port'));
});

// websockets
const SocketIO = require('socket.io');
const io = SocketIO(server);

io.on('connection',()=>{
    console.log('new connection');
});


