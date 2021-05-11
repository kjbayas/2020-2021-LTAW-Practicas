// DOM

let display = document.getElementById("display");
let message = document.getElementById("message");
let username = document.getElementById("username");
let actions = document.getElementById('actions');


//-- Crear un websocket, estableciendo conexión con el servidor
const socket = io();
//-- Al escribir se envía un mensaje al servidor
message.addEventListener('keypress', function(){
  socket.emit("typing", username.value);
});
socket.on("message", (msg)=>{
  display.innerHTML += '<p style="color:black">' + msg.username + ": " + msg.message + '</p>';
  actions.innerHTML = "";
});

socket.on('typing', function(msg){
  actions.innerHTML=`<p><em>${msg} esta escribiendo....</em></p>`
});

socket.on("commands", (msg)=>{
  if (msg.username == username.value) {
    msg.username = "servidor";
    display.innerHTML += '<p style="color:blue">' + msg.username + ": " + msg.message + '</p>';
  }
  actions.innerHTML = ""; 
});
//-- Al apretar el botón se envía un mensaje al servidor
message.onchange = () => {
  if (message.value){
    if (username.value == ""){
      socket.emit("message", {
        message : "Te falta un nick",
        username : "Servidor"
      });
    }else{
      socket.emit("message", {
        message : message.value,
        username : username.value
      });
    }
  }
  //-- Borrar el mensaje actual
  message.value = "";
}
