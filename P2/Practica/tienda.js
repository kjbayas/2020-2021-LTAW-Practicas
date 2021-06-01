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
//-- Pagina de error
const ERROR = fs.readFileSync('error.html','utf-8');
//-- Cargar Carro
const CARRITO = fs.readFileSync('carro.html','utf-8');
//-- Cargar productos 
const PRODUCTO1 = fs.readFileSync('producto1.html', 'utf-8');
const PRODUCTO2 = fs.readFileSync('producto2.html', 'utf-8');
const PRODUCTO3 = fs.readFileSync('producto3.html', 'utf-8');
const PRODUCTO4 = fs.readFileSync('producto4.html', 'utf-8');
//-- Carro con articulos
let carro_productos = false;
let busqueda;
//-- Cargar Login-Pedido
const FORMULARIO = fs.readFileSync('login.html','utf-8');
const PEDIDO = fs.readFileSync('pedido.html','utf-8');
// -- Cargar pagina de respuestas 
const LOGIN1 = fs.readFileSync('login1.html','utf-8');
const LOGIN2 = fs.readFileSync('login2.html','utf-8');
const PEDIDO1 = fs.readFileSync('pedido1.html','utf-8');
const ADD1 = fs.readFileSync('add.html', 'utf-8');
//Fichero JSON
const FICHEROJSON = "tienda.json";
const FICHERO_JSON_PRUEBA = "tienda_prueba.json";
//-- Leer el fichero JSON (lectura sincrona)
const  tiendajson = fs.readFileSync(FICHEROJSON);
//-- Crear la estructura tienda a partir del contenido del fichero
const tienda = JSON.parse(tiendajson);
//-- Crear una lista de usuarios registrados.
let users_reg = [];
console.log("Registered Users");
tienda[1]["usuarios"].forEach((element, index)=>{
    console.log("Usuario " + (index + 1) + ": " + element.user);
    users_reg.push(element.user);
  });
console.log();

//-- Lista de productos disponibles 
let prod_list =[];
let prod_disp =[];
console.log("Productos Disponibles");
tienda[0]["productos"].forEach((element, index)=>{
    console.log("Producto" + (index + 1)+ ":" + element.nombre + ",Stock:" + element.stock + ",Precio:" + element.precio);
    prod_disp.push([element.nombre, element.descripcion, element.stock, element.precio]);
    prod_list.push(element.nombre);
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
      if (nombre.trim()=== 'user'){
        user = valor;
      }
    });
    return user || null;
  }
}
//-- añadir a la carrito
function add_products(req, res, producto){
  const cookie = req.headers.cookie;
  if(cookie){
    //-- par de nombre valor 
    let par = cookie.split(";");
    par.forEach((element,index)=>{
      let [nombre, valor] = element.split("=");
      if (nombre.trim() === 'carrito') {
        res.setHeader('Set-Cookie', element + ':' + producto);
      }
    });
  }
}

function carro_obtenido(req){
  const cookie =req.headers.cookie;
  if(cookie){
    let par =cookie.split(";");
    let carrito;
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
      if (nombre.trim()==='carrito'){
        productos =valor.split(':');
        productos.forEach((producto)=>{
          if(producto == 'topdeportivo'){
            if (num_topdeportivo ==  0 ){
              topdeportivo = prod_disp[0][0];
            }
            num_topdeportivo += 1;
          }else if(producto == 'pantaloncorto'){
            if (num_pantaloncorto ==  0 ){
              pantaloncorto = prod_disp[1][0];
            }
            num_pantaloncorto += 1;
          }else if(producto == 'conjunto'){
            if (num_conjunto ==  0 ){
              conjunto = prod_disp[2][0];
            }
            num_conjunto += 1;
          }else if(producto == 'ligasderesistencia'){
            if (num_ligasderesistencia ==  0 ){
              ligasderesistencia = prod_disp[3][0];
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
        carrito = topdeportivo + '<br>' + pantaloncorto + '<br>' + conjunto + '<br>' + ligasderesistencia;
      }
    });
    return carrito || null;
  }
}
//-- Pagina de producto
var n;
function get_prod(n, content){
  content = content.replace('NOMBRE',prod_disp[n][0]);
  content = content.replace('DESCRIPCION',prod_disp[n][1]);
  content = content.replace('PRECIO',prod_disp[n][3]);
  return content;
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

    //-- Por defecto -> pagina de inicio
    let content_type = mimeType["html"];
    let content = "";
    let recurso = myURL.pathname;
    recurso = recurso.substr(1);

    switch(recurso){
      case '':
        console.log("Pagina Inicio")
        content = INICIO;
        let user = getuser(req);
        if (user){
          content = INICIO.replace("HTML_EXTRA","<h3>Usuario:" + user +"</h3>"
          + `<form action="/carrito" method="get"><input type="submit" value="carrito"/></form>`);
        }else{
          content = INICIO.replace("HTML_EXTRA",
          `<form action="/login" method="get"><input type="submit" value="Login"/></form>`);
        }
        break;
      case 'producto1':
        n = 0;
        content = PRODUCTO1;
        content = get_prod(n,content);
        break;
      case 'producto2':
        n = 1;
        content = PRODUCTO2;
        content = get_prod(n,content);
        break;
      case 'producto3':
        n = 2;
        content = PRODUCTO3;
        content = get_prod(n,content);
        break;
      case 'producto4':
        n = 3;
        content = PRODUCTO4;
        content = get_prod(n,content);
        break;
      
      case 'add_topdeportivo':
        content = ADD1;
        if(carro_productos){
          add_products(req,res,'topdeportivo');
        }else{
          res.setHeader('Set-Cookie', 'carrito=topdeportivo');
          carro_productos = true;
        }
        users_registrado = getuser(req);
        if (users_registrado){
          content = ADD1.replace("HTML_EXTRA", `<form action="/carrito" method="get"><input type="submit" value"Go Cart"/></form>`);
        }else{
          content = ADD1.replace("HTML_EXTRA", `<form action="/login" method="get"><input type="submit" value"Login"/></form>`);
        }
        break;

      case 'add_pantaloncorto':
        content = ADD1;
        if(carro_productos){
          add_products(req,res,'pantaloncorto');
        }else{
          res.setHeader('Set-Cookie', 'carrito=pantaloncorto');
          carro_productos = true;
        }
        users_registrado = getuser(req);
        if (users_registrado){
          content = ADD1.replace("HTML_EXTRA", `<form action="/carrito" method="get"><input type="submit" value"Go Cart"/></form>`);
        }else{
          content = ADD1.replace("HTML_EXTRA", `<form action="/login" method="get"><input type="submit" value"Login"/></form>`);
        }
        break;

      case 'add_conjunto':
        content = ADD1;
        if(carro_productos){
          add_products(req,res,'conjunto');
        }else{
          res.setHeader('Set-Cookie', 'carrito=conjunto');
          carro_productos = true;
        }
        users_registrado = getuser(req);
        if (users_registrado){
          content = ADD1.replace("HTML_EXTRA", `<form action="/carrito" method="get"><input type="submit" value"Go Cart"/></form>`);
        }else{
          content = ADD1.replace("HTML_EXTRA", `<form action="/login" method="get"><input type="submit" value"Login"/></form>`);
        }
        break;

      case 'add_ligasderesistencia':
        content = ADD1;
        if(carro_productos){
          add_products(req,res,'ligasderesistencia');
        }else{
          res.setHeader('Set-Cookie', 'carrito=ligasderesistencia');
          carro_productos = true;
        }
        users_registrado = getuser(req);
        if (users_registrado){
          content = ADD1.replace("HTML_EXTRA", `<form action="/carrito" method="get"><input type="submit" value"Go Cart"/></form>`);
        }else{
          content = ADD1.replace("HTML_EXTRA", `<form action="/login" method="get"><input type="submit" value"Login"/></form>`);
        }
        break;

      case 'carrito':
        content = CARRITO;
        let carrito = carro_obtenido(req);
        content = content.replace("PRODUCTOS", carrito);
        break;
      
      case 'login':
        content = FORMULARIO;
        break;
      
      case 'procesarlogin':
        let usuario = myURL.searchParams.get('nombre');
        console.log('Nombre: ' + usuario);
        if (users_reg.includes(usuario)){
            console.log('Correctly registered user');
            res.setHeader('Set-Cookie', "user=" + usuario);
            content = LOGIN1;
            html_extra = usuario;
            content = content.replace("HTML_EXTRA", html_extra);
        }else{
            content = LOGIN2;
        }
        break;
      
      case 'pedido':
        content = PEDIDO;
        let pedido = carro_obtenido(req);
        content = content.replace("PRODUCTOS", pedido);
        break;
      
      case 'procesarpedido':
        let direccion = myURL.searchParams.get('dirección');
        let tarjeta = myURL.searchParams.get('tarjeta');
        console.log("Dirección de envío: " + direccion + "\n" +
                    "Número de la tarjeta: " + tarjeta + "\n");
        carro = carro_obtenido(req);
        producto_unidades = carro.split('<br>');
        console.log(producto_unidades);

        let list_product = [];
        let list_unidades = [];
        producto_unidades.forEach((element, index) => {
          let [producto, unidades] = element.split(' x ');
          list_product.push(producto);
          list_unidades.push(unidades);
        });
        
        tienda[0]["productos"].forEach((element, index)=>{
          console.log("Producto " + (index + 1) + ": " + element.nombre);
          console.log(list_product[index]);
          console.log();
          if (element.nombre == list_product[index]){
            element.stock = element.stock - list_unidades[index];
          }
        });
        console.log();
        
        if ((direccion != null) && (tarjeta != null)) {
          let pedido = {
            "user": getuser(req),
            "dirección": direccion,
            "tarjeta": tarjeta,
            "productos": producto_unidades
          }
          tienda[2]["pedidos"].push(pedido);
          let myTienda = JSON.stringify(tienda, null, 4);
          fs.writeFileSync(FICHERO_JSON_PRUEBA, myTienda);
        }
        //-- Confirmar pedido
        console.log('Correctly processed order');
        content = PEDIDO1;
        break;
      
      //-- Barra de búsqueda
      case 'productos':
          console.log("Peticion de Productos!")
          content_type = mimeType["json"]; 
          //-- Leer los parámetros
          let param1 = myURL.searchParams.get('param1');
          param1 = param1.toUpperCase();
          console.log("  Param: " +  param1);
          let result = [];
          for (let prod of prod_list) {
              prodU = prod.toUpperCase();
              if (prodU.startsWith(param1)) {
                  result.push(prod);
              }          
          }
          console.log(result);
          busqueda = result;
          content = JSON.stringify(result);
          break;
        
      case 'buscar':
        if (busqueda == 'Top Deportivo') {
          n = 0;
          content = PRODUCTO1;
          content = get_prod(n, content);
        }else if(busqueda == 'pantalones cortos'){
          n = 1;
          content = PRODUCTO2;
          content = get_prod(n, content);
        }else if(busqueda == 'Conjunto'){
          n = 2;
          content = PRODUCTO3;
          content = get_prod(n, content);
        }else if(busqueda == 'Bandas de resistencia'){
          n = 3;
          content = PRODUCTO4;
          content = get_prod(n, content);
        }
        break;
    
      case 'cliente.js':
        console.log("recurso: " + recurso);
        fs.readFile(recurso, 'utf-8', (err,data) => {
            if (err) {
                console.log("Error: " + err)
                return;
            } else {
              res.setHeader('Content-Type', mimeType["js"]);
              res.write(data);
              res.end();
            }
        });
        return;
        break;

      default:
        res.setHeader('Content-Type', mimeType["html"]);
        res.statusCode = 404;
        res.write(ERROR);
        res.end();
        return;
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