const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = 9000

var users = 0;

// servidor
http.listen(PORT, function(){
  console.log('Servidor lanzado en puerto ' + PORT);
});

//-- Página principal
app.get('/', (req, res) => {
  let path = __dirname + '/chat.html';
  res.sendFile(path);
  console.log("Acceso a " + path);
});

//-- El resto de peticiones se interpretan como ficheros estáticos
app.use('/', express.static(__dirname +'/'));

// WEBSOCKETS
io.on('connection', function(socket){
  console.log('--> Usuario conectado . Socket id: ' + socket.id);
  users = users + 1;

  //socket.emit('hello', "Bienvenido al Chat, eres el usuario " + users);
  //socket.broadcast.emit('commands', 'Nuevo usuario se ha unido a la conversación');
  socket.on('typing',(msg)=>{
    socket.broadcast.emit('typing',msg);
  });
  //-- Mensaje recibido: Reenviarlo a todos los clientes conectados
  socket.on("message", (msg)=> {
    console.log(msg.username + ": " + msg.message);
    if (msg.message[0] == "/") {
        switch (msg.message) {
            case "/help":
              msg.message = "/list, /hello, /date";
              io.emit("commands", msg);
              break;
            case "/list":
              msg.message = "Hay " + users + " usuarios en el chat";
              io.emit("commands", msg);
              break;
            case "/hello":
              msg.message = "Hola estas en el chat de Karol";
              io.emit("commands", msg);
              break;
            case "/date":
              let date = new Date();
              let day = date.getDate();
              let month = date.getMonth() + 1;
              let year = date.getFullYear();
              msg.message = "El día de hoy es: " + day + "/" + month + "/" + year;
              io.emit("commands", msg);
              break;           
            default:
              io.sockets.emit("message", msg);
        }
    }else{
        io.sockets.emit("message", msg);
    }
  });

  socket.on("escritura", (msg)=> {
    socket.broadcast.emit("escritura", msg);
  });

  //-- Usuario desconectado. Imprimir el identificador de su socket
  socket.on('disconnect', function(){
    users = users - 1;
    console.log('Este Usuario se ha desconectado --> Socket id: ' + socket.id);
    socket.broadcast.emit('commands', 'Un usuario ha abandonado la conversación');
  });
});