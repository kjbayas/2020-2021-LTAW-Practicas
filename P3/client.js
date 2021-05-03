//DOM
const display = document.getElementById("display");
const message = document.getElementById("message");
const send = document.getElementById("send");

//-- Crear un websocket, estableciendo conexión con el servidor
const socket = io();

socket.on('hello', (message) => {
  console.log("Mensaje del servidor: " + message);
  display.innerHTML = "<ul class='server'>" + message + "</ul>";
});

socket.on('cmd', (message) => {
  console.log("Mensaje del servidor: " + message);
  display.innerHTML += "<ul class='server'>" + message + "</ul>";
});

socket.on('message', (message) => {
  console.log(message)
  display.innerHTML += "<ul class='message'>" + message + "</ul>";
});

send.onclick = () => {
  if (message.value) {
    let initial = message.value.charAt(0)
    console.log(initial)
    if (initial == "/") {
      socket.emit('cmd', message.value)
    } else {
      socket.emit('message', message.value)
    }
    message.value="";
  }
}