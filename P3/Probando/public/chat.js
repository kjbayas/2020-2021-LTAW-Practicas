const socket = io()
// Dom elements
let message = document.getElementById('message');
let username = document.getElementById('username');
let btn = document.getElementById('send');
let output = document.getElementById('output');
let actions = document.getElementById('actions');

// -- Emite los datos
btn.addEventListener('click', function(){
    socket.emit('chat:message', {
        message:message.value,
        username:username.value
    });

    send.onclick = () => {
      if (message.value) {
        let initial = message.value.charAt(0)
        console.log(initial)
        if (initial == "/") {
          socket.emit('message', message.value)
        } else {
          socket.emit('message', message.value)
        }
        message.value="";
      }
    }
});

message.addEventListener('keypress', function(){
    socket.emit('chat:typing', username.value);
});


socket.on('chat:message', function(data) {
    actions.innerHTML= '';
    output.innerHTML += `<p>
    <strong>${data.username}</strong>: ${data.message}
    </p>`
}); 

socket.on('chat:typing', function(data){
    actions.innerHTML=`<p><em>${data} esta escribiendo....</em></p>`
});


