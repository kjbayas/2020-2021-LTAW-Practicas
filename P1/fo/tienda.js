const http = require('http');
const fs = require('fs');
const url = require('url');

const PUERTO = 9000

const server = http.createServer((req, res) => {
    
    //-- Indicamos que se ha recibido una petición
    console.log("Petición recibida!");

    var myURL = url.parse(req.url, true);
    console.log("Recurso solicitado (URL): " + req.url);
    console.log("Recurso: " + myURL.pathname);

    var fich = "";

    if(myURL.pathname == '/'){
        fich += "/tienda.html"; //-- Página principal de la tienda
    }else{
        fich += myURL.pathname; //-- Otro recurso.
    }
    console.log("Fichero a devolver: " + fich);

    fich_type = fich.split(".")[1]; //-- Extension del archivo.
    fich = "." + fich; //-- Leer el archivo.
    console.log("Nombre del Fichero: " + fich);
    console.log("Tipo de Fichero: " + fich_type);

    fs.readFile(fich, function(err, data){
        var mime = "text/html"

        if (fich_type == "css"){
            mime = "text/css";
        }
        
        if (fich_type == 'jpg' || fich_type == 'png'|| fich_type == 'jpeg'){
            mime ="image/"+ fich_type;
        }

        if ((err) || fich == "./error.html"){
            res.writeHead(404,{'Content-Type': mime})
            console.log("Respuesta: 404 Not Found")
        }else{
            res.writeHead(200, {'Content-Type': mime});
            console.log("Respuesta: 200 OK")
        }
        res.write(data);
        res.end();
    });
});

server.listen(PUERTO);

console.log("Servidor Activado!. Escuchando en el puerto " + PUERTO);