const path = require('path');
const express = require('express');
const app = express();

app.set('port', process.env.Port || 8000);

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

io.on('connection',(socket)=>{
    console.log('new connection',socket.id);

    socket.on('chat:message', (data) =>{ 
        io.sockets.emit('chat:message', data);
    });

    socket.on('chat:typing',(data)=>{
        socket.broadcast.emit('chat:typing',data);
    });

    socket.on('chat:message', (data)=>{
        switch(data) {
            case "/help":
                data = "Comandos: /help, /list, /hello, /date";
            break;
            case "/hello":
                data = "Hola estas en el chat de Karol";
            break;
            default:
                message = "Este comando no se ha podido encontrar"
        }
        io.to(socket.id).emit('chat:message', data);
    })

});
