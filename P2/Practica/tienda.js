const http = require('http');
const url = require('url');
const fs = require('fs');
const PUERTO = 8080
let carrito = ''
let productos = ["piña","fresas","naranjas","calabaza","cebolla","tomate","zanahoria","pimientos","lechuga"];


//--Pregunta examen que devuelva otra peticion o añadir puertas traseras
//-- Configurar y lanzar el servidor. Por cada peticion recibida
//-- se imprime un mensaje en la consola
http.createServer((req, res) => {
  console.log("----------> Peticion recibida")
  let q = url.parse(req.url, true);
  console.log("Recurso:" + q.pathname)

  //-- Leer las cookies
  const cookie = req.headers.cookie;

  let filename = ""
  //--tipos mime que nos podemos encontrar
  const mime = {
   'html' : 'text/html',
   'css'  : 'text/css',
   'jpg'  : 'image/jpg',
   'png'  : 'image/png',
   'ico'  : 'image/x-icon',
   'mp3'  :	'audio/mpeg3',
   'mp4'  : 'video/mp4',
   'json' : 'application/json',
   'js'   : 'application/javascript'
  };
  //-- Obtener fichero a devolver
  if (q.pathname == "/") {
    filename += "/tienda.html"
  } else {
    filename += q.pathname
  }

  //--nos quedamos con el fichero a devolver
  let str = filename.substr(1)
  //--Se comprueba si el fichero es un html y no es el fichero login.html
  if (str.split(".")[1]=="html" && str!="login.html") {
    console.log('hola');
    console.log();
    //--comprobando si hay cookie de autentificación
    if (!cookie.includes("user=")) {
      //--si no hay cookies te manda a la pagina para autentificarte
      str = "autentificacion.html"
    }
  }

  //--si en el fichero contiene la palabra carro quiere decir que es un producto
  //--Para el carrito
  if (str.includes("carro")) {
    //--Se comprueba que el usuario esta registrado
    if (cookie.includes("user=")) {
      var prod=str.split("_")[1]
      var arrycookie = cookie.split(';')
      //--devuelve el indice donde se encuentra las cookies del carrito
      var aux = arrycookie.findIndex((element) => element.includes('carrito='))
      if (aux == -1) {
        //--si no hay cookies del carrito las crea
        carrito = 'carrito=' + prod
      } else {
        //--si ya existe se añade el nuevo producto
        carrito = arrycookie[aux] + '&' + prod
      }
      //--Se añade en la cabecera las cookies del carrito y se va a la pagina carro.html
      res.setHeader('Set-Cookie', carrito)
      str='carro.html'
    } else {
      //--si no esta registrado se le manda a la pagina para regstrarse
      str="autentificacion.html"
    }
  }

  //--funcion que te dvueve parte del html con la lista de la compra que estaba en el carrito
  function list_compra(content) {
    if (cookie.includes("carrito=")) {
      content += `</p>
                  <p>Productos comprados: </p>
                  <p>`
      var arrycookie = cookie.split(';')
      var aux = arrycookie.findIndex((element) => element.includes('carrito='))
      //--array de todos los productos del carrito
      var arrayprod=arrycookie[aux].split('=')[1].split('&')
      var repetidos= []
      //--se comprueba los productos repetidos
      for (var i = 0; i < arrayprod.length; i++) {
        var num = 0
        for (var j = 0; j < arrayprod.length; j++) {
          if (arrayprod[i] == arrayprod[j]) {
            num += 1
          }
        }
        //--En el caso de que no se haya puesto en la lista, ese producto
        if (repetidos.indexOf(arrayprod[i]) == -1) {
          repetidos.push(arrayprod[i])
          content += '<li>'+ num + ' Disfraz de '+ decodeURIComponent(arrayprod[i]) + '</li>'
        }
      }
      content += '</p>'
    } else {
      content += '<p>No ha seleccionado ningún prducto vuelve a la página principal</p>'
    }
    return content
  }

  // despues de realizar el pedido
  if (str=='respuesta.html') {
    if (req.method === 'POST') {
      var content = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Pedido</title>
          <link rel="stylesheet" href="css/autentificacion.css">
          <link rel="icon" href="img/foto.ico">
        </head>
        <body>
          <div>
            <h1>Recibo de compra</h1>
            <p>Datos de compra: </p>
            <p>`

      req.on('data', chunk => {
          //-- Leer los datos (convertir el buffer a cadena)
          data = chunk.toString().split('&');

          //-- Añadir los datos a la respuesta
          for (var i = 0; i < data.length; i++) {
            content += decodeURIComponent(data[i].replace(/\+/gi,' ')) + '<br>'
          }
          //--Añadir los productos seleccionados
          content = list_compra(content)
          //-- Fin del mensaje. Enlace al formulario
          content += `
                <p>Comprueba que los datos son correctos, si no lo son vuelve al formulario:</p>
                <a href="/comprar.html">[Formulario]</a>
                <p>Para seguir comprando vuelve a la pagina principal: </p>
                <a href="index.html">[Pagina principal]</a>
              </div>
            </body>
          </html>
          `
          //-- Mostrar los datos en la consola del servidor
          console.log("Datos recibidos: " + data)
          res.statusCode = 200;
       });

       req.on('end', ()=> {
         //-- Generar el mensaje de respuesta
         res.setHeader('Content-Type', 'text/html')
         res.write(content);
         res.end();
       })
       return
    }
  }
  //-- Acceso al recurso JSON
  if (str=='myquery') {
    var resultado = [];
    //-- Leer los parámetros recibidos en la peticion
    const params = q.query;
    if (params.p.length!=0) {
      for (var i = 0; i < productos.length; i++) {
        //--si a la 3 letra coincide con alguno de los productos
        if (productos[i].startsWith(params.p.toLowerCase()) && params.p.length >= 3){
          resultado.push(productos[i])
        }
      }
    }
    //-- El array de productos lo pasamos a una cadena de texto,
    //-- en formato JSON:
    content = JSON.stringify(resultado) + '\n';
    //-- Generar el mensaje de respuesta
    //-- IMPORTANTE! Hay que indicar que se trata de un objeto JSON
    //-- en la cabecera Content-Type
    res.setHeader('Content-Type', 'application/json')
    res.write(content);
    res.end();
    return
  }

 //--En el caso que se quiera ver un único producto
  if (str =='informacion') {
    if (req.method === 'POST') {
      var content = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Informacion</title>
          <link rel="stylesheet" href="css/autentificacion.css">
          <link rel="icon" href="img/foto.ico">
        </head>
        <body>
          <div>
            <h1>Información de producto</h1>`
      req.on('data', chunk => {
          //-- Leer los datos (convertir el buffer a cadena)
          data = chunk.toString().split('=')[1].toLowerCase();
          switch (data) {
            case 'diablesa':
              content += `<img src="img/diablesa.jpg" alt="Disfraz diablo chica">
                          <p>Disfraz diablesa</p>
                          <p>Precio: 26€</p>
                          <p>Tallas: S,M,L</p>
                          <a href="/carro_diablesa">Añadir al carrito</a>`
              break;
            case 'asesino':
              content += `<img src="img/asesino.jpg" alt="Disfraz asesino hombre">
                          <p>Disfraz asesino</p>
                          <p>Precio: 35€</p>
                          <p>Tallas: S,M,L,XL,XXL</p>
                          <a href="/carro_asesino">Añadir al carrito</a>`
              break;
            case 'monja':
                content += `<img src="img/monja.jpg" alt="Disfraz monja muerta">
                            <p>Disfraz monja muerta mujer</p>
                            <p>Precio: 50€</p>
                            <p>Tallas: S,M,L,XL</p>
                            <a href="/carro_monja">Añadir al carrito</a>`
                break;
            case 'monja':
                content += `<img src="img/monja.jpg" alt="Disfraz monja muerta">
                            <p>Disfraz monja muerta mujer</p>
                            <p>Precio: 50€</p>
                            <p>Tallas: S,M,L,XL</p>
                            <a href="/carro_monja">Añadir al carrito</a>`
                break;
            case 'marshall':
                content += `<img src="img/marshall.jpg" alt="Disfraz marsahll patrulla canina">
                            <p>Disfraz Marshall patrulla canina</p>
                            <p>Precio: 40€</p>
                            <p>Tallas: 3-6 años</p>
                            <a href="/carro_marshall">Añadir al carrito</a>`
                break;
            case 'naruto':
                content += `<img src="img/naruto.jpg" alt="Disfraz Naruto">
                            <p>Disfraz Naruto</p>
                            <p>Precio: 45€</p>
                            <p>Tallas: 10-12 años </p>
                            <a href="/carro_naruto">Añadir al carrito</a>`
                break;
            case 'goku':
                content += `<img src="img/goku.jpg" alt="Disfraz Goku">
                            <p>Disfraz Goku</p>
                            <p>Precio: 40€</p>
                            <p>Tallas: 8-10 años</p>
                            <a href="/carro_goku">Añadir al carrito</a>`
                break;
            case 'elfo':
                content += `<img src="img/navidad.jpg" alt="Disfraz elfo">
                            <p>Disfraz elfo</p>
                            <p>Precio: 40€</p>
                            <p>Tallas: XS,S,M,L</p>
                            <a href="/carro_elfo">Añadir al carrito</a>`
                break;
            case 'angel':
                content += `<img src="img/angel.jpg" alt="Disfraz Angel">
                            <p>Disfraz Angel</p>
                            <p>Precio: 20€</p>
                            <p>Tallas: XS,S,M </p>
                            <a href="/carro_angel">Añadir al carrito</a>`
                break;
            case 'arbol':
                content += `<img src="img/arbol.jpg" alt="Disfraz Arbol de navidad">
                            <p>Disfraz de arbol de navidad</p>
                            <p>Precio: 20€</p>
                            <p>Tallas: S,M,L,XL,XXL</p>
                            <a href="/carro_arbol">Añadir al carrito</a>`
                break;
            default:
                  content += '<p>No hay ningún producto con el nombre: ' + data +'</p>'
          }
          //-- Fin del mensaje. Enlace al formulario
          content += `
                <p>Si quieres continuar buscando:</p>
                <a href="/busqueda.html">[Buscar productos]</a>
                <p>Para seguir comprando vuelve a la pagina principal: </p>
                <a href="index.html">[Pagina principal]</a>
              </div>
            </body>
          </html>
          `
          //-- Mostrar los datos en la consola del servidor
          console.log("Datos recibidos: " + data)
          res.statusCode = 200;

       });

       req.on('end', ()=> {
         //-- Generar el mensaje de respuesta
         res.setHeader('Content-Type', 'text/html')
         res.write(content);
         res.end();
       })
       return
    }
  }

  //-- Leer fichero
  fs.readFile(str, function(err, data) {
    if (str == "login.html") {
      res.setHeader('Set-Cookie', 'user=claualbra')
    }else if (str=='comprar.html') {
      data = list_compra(data)
    }
    //-- Tipo mime
    let mimeType =  mime[str.split(".")[1]];

    //-- Fichero no encontrado. Devolver mensaje de error
    if (err == null) {
      //-- Generar el mensaje de respuesta
      res.writeHead(200, {'Content-Type': mimeType});
    } else {
      res.writeHead(404, {'Content-Type': mimeType});
      return res.end("404 Not Found");
    }
    res.write(data);
    res.end();
  });

}).listen(PUERTO);

console.log("Servidor corriendo...")
console.log("Puerto: " + PUERTO)