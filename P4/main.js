const electron = require('electron');
const ip = require('ip');

console.log("Hola desde el proceso de la web...");

var PORT = "8080";
//-- Obtener elementos de la interfaz
const btn_test = document.getElementById("btn_test");
const display = document.getElementById("display");
const info1 = document.getElementById("info1");
const info2 = document.getElementById("info2");
const info3 = document.getElementById("info3");
const info4 = document.getElementById("info4");
const info5 = document.getElementById("info5");
const numusers = document.getElementById("numuser");
const IP = document.getElementById("ip");

//-- Acceder a la API de node para obtener la info
//-- Sólo es posible si nos han dado permisos desde
//-- el proceso princpal
info1.textContent = process.arch;
info2.textContent = process.platform;
info3.textContent = process.versions.node;
info4.textContent = process.versions.chrome;
info5.textContent = process.versions.electron;
IP.textContent = ip.address();
IP.textContent += ":" + PORT;

btn_test.onclick = () => {
    display.innerHTML += "<p>" + "Karol: Hola!" + "</p>";
    //-- Enviar mensaje al proceso principal
    electron.ipcRenderer.invoke('test', "MENSAJE DE PRUEBA");
}

//-- Mensaje recibido del proceso MAIN
electron.ipcRenderer.on('print', (event, message) => {
    console.log("Recibido: " + message);
    numuser.textContent = message;
});

electron.ipcRenderer.on('chat', (event, msg) => {
    console.log("Recibido: " + msg);
    display.innerHTML += '<p style="color:black">' + msg.username + ": " + msg.message + '</p>';
});