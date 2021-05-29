console.log("Ejecutando Javascript...");

//-- Elementos HTML para mostrar informacion
const display1 = document.getElementById("display1");

//-- Caja de busqueda
const caja = document.getElementById("caja");

caja.oninput = () => {
    const m = new XMLHttpRequest();
    m.onreadystatechange = () => {

        //-- Petición enviada y recibida.
        if (m.readyState==4) {

            //-- Respuesta ok
            if (m.status==200) {
                let productos = JSON.parse(m.responseText)
                console.log(productos);
                display1.innerHTML = "";
                for (let i=0; i < productos.length; i++) {
                    display1.innerHTML += productos[i];
                    if (i < productos.length-1) {
                    display1.innerHTML += ', ';
                    }
                }
            } else {
                console.log("Error en la petición: " + m.status + " " + m.statusText);
                display2.innerHTML += '<p>ERROR</p>'
            }
        }
    }

    console.log(caja.value.length);
    if (caja.value.length >= 1) {
      m.open("GET","/productos?param1=" + caja.value, true);
      m.send();
    } else {
        display1.innerHTML="";
    }
}