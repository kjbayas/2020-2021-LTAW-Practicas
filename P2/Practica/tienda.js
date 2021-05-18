//-- Servidor de mi tienda
const http = require('http');
const fs = require('fs');

const PUERTO = 8080;

//-- Pagina principal de la web
const INICIO = fs.readFileSync('tienda.html', 'utf-8');

//-- Cargar pagina web del formulario login
const FORMULARIO = fs.readFileSync('login.html','utf-8');

//-- Registro -> Fichero JSON
const FICHERO_JSON = "tienda.json";
//-- Leer el fichero JSON (lectura sincrona)
const  tienda_json = fs.readFileSync(FICHERO_JSON);
//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tienda_json);
//-- Crear una lista de usuarios registrados.
let users_reg = [];
console.log("Lista de usuarios registrados");
console.log("-----------------------------");
tienda[1]["usuarios"].forEach((element, index)=>{
    console.log("Usuario " + (index + 1) + ": " + element.user);
    users_reg.push(element.user);
  });
console.log();
//-- Crear el SERVIDOR.
const server = http.createServer((req, res) => {
    //-- Construir el objeto url con la url de la solicitud
    const myURL = new URL(req.url, 'http://' + req.headers['host']);  
    console.log("");
    console.log("Método: " + req.method);
    console.log("Recurso: " + req.url);
    console.log("Ruta: " + myURL.pathname);
    console.log("Parametros: " + myURL.searchParams);

    //-- Obtener el nombre de usuario
    let user = myURL.searchParams.get('nombre');
    console.log('Nombre: ' + user);

    //-- Por defecto -> pagina de inicio
    let content_type = "text/html";
    let content = INICIO;
    //-- Acceso al formulario login
    if (myURL.pathname == '/login') {
        content_type = "text/html";
        content = FORMULARIO;
    }
    //-- Procesar la respuesta del formulario
    if (myURL.pathname == '/procesar') {
        content_type = "text/html";
        //-- Dar bienvenida solo a usuarios registrados.
        if (users_reg.includes(user)){
            console.log('El usuario esta registrado');
            content = LOGIN_OK;
            html_extra = user;
            content = content.replace("HTML_EXTRA", html_extra);
        }else{
            content = LOGIN_KO;
        }
    }
    //-- Si hay datos en el cuerpo, se imprimen
  req.on('data', (cuerpo) => {
    //-- Los datos del cuerpo son caracteres
    req.setEncoding('utf8');
    console.log(`Cuerpo (${cuerpo.length} bytes)`)
    console.log(` ${cuerpo}`);
  });
  //-- Esto solo se ejecuta cuando llega el final del mensaje de solicitud
  req.on('end', ()=> {
    //-- Generar respuesta
    res.setHeader('Content-Type', content_type);
    res.write(content);
    res.end()
  });


});

server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);