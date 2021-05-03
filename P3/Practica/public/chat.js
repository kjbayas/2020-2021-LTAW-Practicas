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
});

socket.on('chat:message', function(data) {
    output.innerHTML += `<p>
    <strong>${data.username}</strong>: ${data.message}
    </p>`
}); 