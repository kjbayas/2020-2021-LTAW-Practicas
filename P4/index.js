const express = require('express')
const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);
//-- Cargar el módulo de electron
const electron = require('electron');
const ip = require('ip');

const PORT = 8080

var users = 0;
let win = null;

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


console.log("Arrancando electron...");
electron.app.on('ready', () => {
  console.log("Evento Ready!");

  //-- Crear la ventana principal de nuestra aplicación
  win = new electron.BrowserWindow({
      width: 900,   //-- Anchura 
      height: 900,  //-- Altura

      //-- Permitir que la ventana tenga ACCESO AL SISTEMA
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
  });

//-- En la parte superior se nos ha creado el menu
//-- por defecto
//-- Si lo queremos quitar, hay que añadir esta línea
//win.setMenuBarVisibility(false)

//-- Cargar contenido web en la ventana
//-- La ventana es en realidad.... ¡un navegador!
//win.loadURL('https://www.urjc.es/etsit');

//-- Cargar interfaz gráfica en HTML
win.loadFile("index.html");
win.on('ready-to-show', () => {
  win.webContents.send('print', users);
});
win.webContents.send('print', users);

//-- Mandar dirección IP
ip_addr = 'http://' + ip.address() + ':' + PORT;
win.webContents.send('print-ip', ip_addr);

});


//-- Esperar a recibir los mensajes de botón apretado (Test) del proceso de 
//-- renderizado. Al recibirlos se escribe una cadena en la consola
electron.ipcMain.handle('test', (event, msg) => {

var msg = {};
msg.username = "Karol-ADMI";
msg.message = "Este es un mensaje de prueba desde el admi Karol!";
io.sockets.emit("message", msg);
console.log("-> Mensaje: " + msg.message);
});

// WEBSOCKETS
io.on('connection', function(socket){
  console.log('--> Usuario conectado . Socket id: ' + socket.id);
  users = users + 1;
  win.webContents.send('print', users);
  socket.emit('hello', "Bienvenido al Chat, eres el usuario " + users);
  socket.broadcast.emit('bienvenida', 'Nuevo usuario se ha unido a la conversación');
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
    win.webContents.send('chat',msg);
    

  });

  socket.on("escritura", (msg)=> {
    socket.broadcast.emit("escritura", msg);
  });

  //-- Usuario desconectado. Imprimir el identificador de su socket
  socket.on('disconnect', function(){
    users = users - 1;
    win.webContents.send('print', users);
    console.log('Este Usuario se ha desconectado --> Socket id: ' + socket.id);
    socket.broadcast.emit('dis', 'Un usuario ha abandonado la conversación');
  });
});
