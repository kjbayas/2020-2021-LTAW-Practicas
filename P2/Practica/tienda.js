//-- Servidor de mi tienda
const http = require('http');
const fs = require('fs');

const PUERTO = 8080;

//-- Definir los tipos de mime
const mime_type = {
    "html" : "text/html",
    "css"  : "text/css",
    "js"   : "application/javascript",
    "jpg"  : "image/jpg",
    "JPG"  : "image/jpg",
    "jpeg" : "image/jpeg",
    "png"  : "image/png",
    "gif"  : "image/gif",
    "ico"  : "image/x-icon",
    "json" : "application/json",
    "TTF"  : "font/ttf"
  };

//-- Pagina principal de la web
const INICIO = fs.readFileSync('tienda.html', 'utf-8');

//-- cargar productos 
const PRODUCTO1 = fs.readFileSync('producto1.html', 'utf-8');

//-- cargar carrito
const CARRITO = fs.readFileSync('carrito.html','utf-8');

//-- carrito con articulos
let carrito_productos = false;

//-- Cargar pagina web del formulario login
const FORMULARIO = fs.readFileSync('login.html','utf-8');
const PEDIDO = fs.readFileSync('pedido.html','utf-8');
// -- Cargar pagina de respuestas 
const LOGIN1 = fs.readFileSync('login1.html','utf-8');
const LOGIN2 = fs.readFileSync('login2.html','utf-8');
const PEDIDO1 = fs.readFileSync('pedido1.html','utf-8');
const ADD = fs.readFileSync('add.html', 'utf-8');




//Fichero JSON
const FICHEROJSON = "tienda.json";
const FICHERO_JSON_PRUEBA = "tienda_prueba.json";
//-- Leer el fichero JSON (lectura sincrona)
const  tiendajson = fs.readFileSync(FICHEROJSON);
//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tiendajson);

//-- Crear una lista de usuarios registrados.
let users_reg = [];
console.log("Lista de usuarios registrados");

tienda[1]["usuarios"].forEach((element, index)=>{
    console.log("Usuario " + (index + 1) + ": " + element.user);
    users_reg.push(element.user);
  });

console.log();
//-- crear una lista de productos 
let prod_disp =[];
console.log("Productos disponibles");
tienda[0]["productos"].forEach((element, index)=>{
    
})
//-- Crear el SERVIDOR.
const server = http.createServer((req, res) => {
    //-- Construir el objeto url con la url de la solicitud
    const myURL = new URL(req.url, 'http://' + req.headers['host']);  
    console.log("");
    console.log("Método: " + req.method);
    console.log("Recurso: " + req.url);
    console.log("Ruta: " + myURL.pathname);
    console.log("Parametros: " + myURL.searchParams);


    //-- Por defecto -> pagina de inicio
    let content_type = "text/html";
    let content = INICIO;

    //-- Acceso al formulario login
    if (myURL.pathname == '/login') {
        content_type = "text/html";
        content = FORMULARIO;
    }
    //-- Procesar la respuesta del formulario
    if (myURL.pathname == '/procesarlogin') {
        //-- nombre usuario
        let user = myURL.searchParams.get('nombre');
        console.log('Nombre: '+ user);
        //-- Mensaje bienvenida
        content_type = "text/html";
        //-- Dar bienvenida solo a usuarios registrados.
        if (users_reg.includes(user)){
            console.log('El usuario esta registrado');
            content = LOGIN1;
            html_extra = user;
            content = content.replace("HTML_EXTRA", html_extra);
        }else{
            content = LOGIN2;
        }
    }

    //-- Formulario del pedido
    if (myURL.pathname == '/pedido') {
        content_type = "text/html";
        content = PEDIDO;
      }
  
      //-- Procesar la respuesta del formulario pedido
      if (myURL.pathname == '/procesarpedido') {
        //-- Guardar los datos del pedido en el fichero JSON
        //-- Primero obtenemos los parametros
        let direccion = myURL.searchParams.get('dirección');
        let tarjeta = myURL.searchParams.get('tarjeta');
        console.log("Dirección de envío: " + direccion + "\n" +
                    "Número de la tarjeta: " + tarjeta + "\n");
        //-- Guardar datos del pedido en el registro tienda.json
        //-- si este no es nulo (null)
        if ((direccion != null) && (tarjeta != null)) {
          let pedido = {
            "user": "root",
            "dirección": direccion,
            "tarjeta": tarjeta,
            "productos": [
              {
                "producto": "conjunto"
              },
              {
                "producto": "ligas de resisitencia"
              }
            ]
          }
          tienda[2]["pedidos"].push(pedido);
          //-- Convertir a JSON y registrarlo
          let myTienda = JSON.stringify(tienda, null, 4);
          fs.writeFileSync(FICHERO_JSON_PRUEBA, myTienda);
        }
        //-- Confirmar pedido
        content_type = "text/html";
        console.log('Pedido procesado correctamente');
        content = PEDIDO1;
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