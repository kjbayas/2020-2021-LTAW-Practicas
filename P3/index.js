const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = 8000

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

  socket.emit('hello', "Bienvenido al Chat, eres el usuario " + users);
  socket.broadcast.emit('cmd', 'Nuevo usuario se ha unido a la conversación');

  //-- Función de retrollamada de mensaje recibido del cliente
  socket.on('message', (message) => {
    console.log("Cliente: " + socket.id + ': ' + message);
    //-- Enviar el mensaje a TODOS los clientes que estén conectados
    io.emit('message', message);
  })

  socket.on('cmd', (message) => {
    console.log("Cliente: " + socket.id + ': ' + message);
    switch(message) {
      case "/help":
        message = "Comandos: /help, /list, /hello, /date";
      break;

      case "/list":
        message = "Hay " + users + " usuarios en el chat";
      break;

      case "/hello":
        message = "Hola estas en el chat de Karol";
      break;

      case "/date":
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        message = "El día de hoy es: " + day + "/" + month + "/" + year;
      break;

      default:
        message = "Este comando no se ha podido encontrar"
    }
    //-- Enviamos el mensaje solo al que nos envia la peticion 
    io.to(socket.id).emit('cmd', message);
  })

  //-- Usuario desconectado. Imprimir el identificador de su socket
  socket.on('disconnect', function(){
    users = users - 1;
    console.log('Este Usuario se ha desconectado --> Socket id: ' + socket.id);
    socket.broadcast.emit('cmd', 'Un usuario ha abandonado la conversación');
  });
});