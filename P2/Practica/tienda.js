//-- Servidor de mi tienda
const http = require('http');
const fs = require('fs');

const PUERTO = 8080;

//-- Definir los tipos de mime
const mimeType = {
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

//-- Cargar productos 
const PRODUCTO1 = fs.readFileSync('producto1.html', 'utf-8');
const PRODUCTO2 = fs.readFileSync('producto2.html', 'utf-8');
const PRODUCTO3 = fs.readFileSync('producto3.html', 'utf-8');
const PRODUCTO4 = fs.readFileSync('producto4.html', 'utf-8');

//-- Cargar carro
const CARRO = fs.readFileSync('carro.html','utf-8');

//-- Carro con articulos
let carro_productos = false;

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

//-- Lista de productos creado
let prod_disp =[];
console.log("Productos Disponibles");
tienda[0]["productos"].forEach((element, index)=>{
    console.log("Producto" + (index + 1)+ ":" + element.nombre + "Stock:"
    + element.stock + "Precio:" + element.precio);
    prod_disp.push([element.nombre, element.descripcion, 
                    element.stock, element.precio]);
});

// -- Cookies
console.log ();
function getuser(req){
  const cookie = req.headers.cookie;
  if(cookie){
    //-- par de nombre valor 
    let par = cookie.split(";");
    let user;
    par.forEach((element,index)=>{
      let [nombre, valor] = element.split("=");
      if (nombre.trim()== 'user'){
        user = valor;
      }
    });
    return user || null;
  }
}

function añadir(req, res, producto){
  const cookie = req.headers.cookie;
  if(cookie){
    //-- par de nombre valor 
    let par = cookie.split(";");
    par.forEach((element,index)=>{
      let [nombre, valor] = element.split("=");
      if (nombre.trim()== 'carro'){
        res.setHeader('Set-Cookie', element + ':' + producto);
      }
    });
  }
}

function carro_obtenido(req){
  const cookie =req.headers.cookie;
  if(cookie){
    let par =cookie.split(":");
    let carro;
    let topdeportivo = '';
    let num_topdeportivo = 0;
    let pantaloncorto = '';
    let num_pantaloncorto = 0;
    let conjunto = '';
    let num_conjunto = 0;
    let ligasderesistencia = '';
    let num_ligasderesistencia = 0;

    par.forEach((element, index)=>{
      let [nombre,valor] = element.split('=');
      if (nombre.trim()=='carro'){
        productos =valor.split(':');
        productos.forEach((producto)=>{
          if(producto == 'topdeportivo'){
            if (num_topdeportivo ==  0 ){
              topdeportivo = prod_disp[0][0];
            }
            num_topdeportivo += 1;
          }else if(producto == 'pantaloncorto'){
            if (num_pantaloncorto ==  0 ){
              pantaloncorto = prod_disp[0][0];
            }
            num_pantaloncorto += 1;
          }else if(producto == 'conjunto'){
            if (num_conjunto ==  0 ){
              conjunto = prod_disp[0][0];
            }
            num_conjunto += 1;
          }else if(producto == 'conjunto'){
            if (num_ligasderesistencia ==  0 ){
              ligasderesistencia = prod_disp[0][0];
            }
            num_ligasderesistencia += 1;
          }
        });
        
        if (num_topdeportivo != 0){
          topdeportivo += 'x' + num_topdeportivo;
        }
        if (num_pantaloncorto != 0){
          pantaloncorto += 'x' + num_pantaloncorto;
        }
        if(num_conjunto != 0){
          conjunto += 'x' + num_conjunto;
        }
        if(num_ligasderesistencia != 0){
          ligasderesistencia += 'x' + num_ligasderesistencia;
        }
        carro = topdeportivo + '<br>' + pantaloncorto + '<br>' + conjunto + '<br>' + ligasderesistencia;
      }
    });
    return carro || null;
  }
}
//-- Crear el SERVIDOR.
const server = http.createServer((req, res) => {
    //-- Construir el objeto url con la url de la solicitud
    const myURL = new URL(req.url, 'http://' + req.headers['host']);  
    console.log("");
    console.log("Método: " + req.method);
    console.log("Recurso: " + req.url);
    console.log("Ruta: " + myURL.pathname);
    console.log("Parametros: " + myURL.searchParams);

    let user = getuser(req);
    //-- Por defecto -> pagina de inicio
    let content_type = "text/html";
    let content = INICIO;
    if (myURL.pathname == '/'){
      if (user){
        content = INICIO.replace("HTML_EXTRA","<h3>Usuario:" + user +"</h3>"
        + `<form action="/carro" method="get"><input type="submit" value="Carro"/></form>`);
      }else{
        content = INICIO.replace("HTML_EXTRA",
        `<form action="/login" method="get"><input type="submit" value="Login"/></form>`);
      }
    }
    //--Productos
    if(myURL.pathname == '/producto1'){
      content_type = mimeType["html"];
        content = PRODUCTO1;
        content = content.replace('NOMBRE',prod_disp[0][0]);
        content = content.replace('DESCRIPCION',prod_disp[0][1]);
        content = content.replace('PRECIO',prod_disp[0][3]);
    }
    if(myURL.pathname == '/producto2'){
      content_type = mimeType["html"];
        content = PRODUCTO2;
        content = content.replace('NOMBRE',prod_disp[1][0]);
        content = content.replace('DESCRIPCION',prod_disp[1][1]);
        content = content.replace('PRECIO',prod_disp[1][3]);
    }
    if(myURL.pathname == '/producto3'){
      content_type = mimeType["html"];
        content = PRODUCTO3;
        content = content.replace('NOMBRE',prod_disp[2][0]);
        content = content.replace('DESCRIPCION',prod_disp[2][1]);
        content = content.replace('PRECIO',prod_disp[2][3]);
    }
    if(myURL.pathname == '/producto4'){
      content_type = mimeType["html"];
        content = PRODUCTO4;
        content = content.replace('NOMBRE',prod_disp[3][0]);
        content = content.replace('DESCRIPCION',prod_disp[3][1]);
        content = content.replace('PRECIO',prod_disp[3][3]);
    }
    //-- Carro
    if(myURL.pathname == '/topdeportivoañadido'){
      if(carro_productos){
        añadir(req,res,'topdeportivo');
      }else{
        res.setHeader('Set-Cookie', 'carro= topdeportivo');
        carro_productos = true;
      }
    }
    if(myURL.pathname == '/pantaloncortoañadido'){
      if(carro_productos){
        añadir(req,res,'pantaloncorto');
      }else{
        res.setHeader('Set-Cookie', 'carro= pantaloncorto');
        carro_productos = true;
      }
    }
    if(myURL.pathname == '/conjuntoañadido'){
      if(carro_productos){
        añadir(req,res,'conjunto');
      }else{
        res.setHeader('Set-Cookie', 'carro= conjunto');
        carro_productos = true;
      }
    }
    if(myURL.pathname == '/ligasderesistenciaañadido'){
      if(carro_productos){
        añadir(req,res,'ligasderesistencia');
      }else{
        res.setHeader('Set-Cookie', 'carro= ligasderesistencia');
        carro_productos = true;
      }
    }
    //-- Acceso al formulario login
    if (myURL.pathname == '/login') {
        content_type = mimeType["html"];
        content = FORMULARIO;
    }
    //-- Procesando respuesta del formulario
    if (myURL.pathname == '/procesarlogin') {
        //-- nombre usuario
        let user = myURL.searchParams.get('nombre');
        console.log('Nombre: '+ user);
        //-- Mensaje bienvenida
        content_type = mimeType["html"];
        //-- Dar bienvenida solo a usuarios registrados.
        if (users_reg.includes(user)){
            console.log('Usuario registrado correctamente');
            content = LOGIN1;
            html_extra = user;
            content = content.replace("HTML_EXTRA", html_extra);
        }else{
            content = LOGIN2;
        }
    }

    //-- Formulario del pedido
    if (myURL.pathname == '/pedido') {
        content_type = mimeType["html"];
        content = PEDIDO;
      }
  
      //-- Procesar la respuesta del formulario pedido
      if (myURL.pathname == '/procesarpedido') {
        //-- Guardamos los datos del pedido en un fichero JSON
        let direccion = myURL.searchParams.get('dirección');
        let tarjeta = myURL.searchParams.get('tarjeta');
        console.log("Dirección de envío: " + direccion + "\n" +
                    "Número de la tarjeta: " + tarjeta + "\n");

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
            ],
            "total": 80 
          }
          tienda[2]["pedidos"].push(pedido);
          //-- Convertir a JSON y registrarlo
          let myTienda = JSON.stringify(tienda, null, 4);
          fs.writeFileSync(FICHERO_JSON_PRUEBA, myTienda);
        }
        //-- Confirmar pedido
        content_type = mimeType["html"];
        console.log('Pedido procesado con exito');
        content = PEDIDO1;
       }
    //-- Si hay datos en el cuerpo, se imprimen
  req.on('data', (cuerpo) => {
    req.setEncoding('utf8');
    console.log(`Cuerpo (${cuerpo.length} bytes)`)
    console.log(` ${cuerpo}`);
  });
  //-- Final del mensaje de solicitud
  req.on('end', ()=> {
    res.setHeader('Content-Type', content_type);
    res.write(content);
    res.end()
  });

});

server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);