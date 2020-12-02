let DB;

// selectores de la interfaz
const form = document.querySelector('form'),
      nombreMascota = document.querySelector('#mascota'),
      nombreCliente = document.querySelector('#cliente'),
      telefono = document.querySelector('#telefono'),
      fecha = document.querySelector('#fecha'),
      hora = document.querySelector('#hora'),
      sintomas = document.querySelector('#sintomas'),
      citas = document.querySelector('#citas'),
      headingAdministra = document.querySelector('#administra');

// esperar por el dom ready 
document.addEventListener('DOMContentLoaded',() => {
    // crear la base de datos

    let crearDB = window.indexedDB.open('citas', 1);
    
    // si hay un error enviarlo a la consola
    crearDB.onerror = function (){
        console.log('hubo un error');

    }
    // si todo esta bien entoces muestra en la consola y asignar la base de datos.
    crearDB.onsuccess = function () { // borra el elmento y crea una y otra vez 

        //console.log('Todo listo !! ');

        // Asignar a la base de datos

        DB = crearDB.result;
        // console.log(DB)

        mostraCitas(); // re llamamos para mostrar
    }
    // este metodo solo corre una vez y es ideal para crear schema 
    crearDB.onupgradeneeded = function(e){  // agrega los distintos metods 
        //console.log('solo una vez!');
        
        // el EVENTO es la misma base de datos
        let db = e.target.result;

         //console.log(db);
         
         // definir el objecstore , toma 2 parametros el nombre de la base
         // de datos y segundo la opciones
         let objecStore = db.createObjectStore('citas', {keyPath: 'key', autoIncrement: true});
 

         // crear los indices y campos de la base datos , crearIndex : 3 parametros , nombre 
         // keypath y opciones

         objecStore.createIndex('mascota', 'mascota', {unique : false});
         objecStore.createIndex('cliente', 'cliente', {unique : false});
         objecStore.createIndex('telefono', 'telefono', {unique : false});
         objecStore.createIndex('fecha', 'fecha', {unique : false});
         objecStore.createIndex('hora', 'hora', {unique : false});
         objecStore.createIndex('sintomas', 'sintomas', {unique : false});

        console.log('base d datos creada y lista!!! ');
        
       
    }
    // cuando el formulario se envia
    form.addEventListener('submit',agregarDatos);

    function agregarDatos(e){
        e.preventDefault();

        const nuevaCita = {
                mascota : nombreMascota.value,
                cliente : nombreCliente.value,
                telefono : telefono.value,
                fecha : fecha.value,
               hora : hora.value,
                sintomas : sintomas.value
        }
       // console.log(nuevaCita);

       // en indexdDB se utilizan las transacciones.  mandando al INDEXdDB
       let transaction = DB.transaction(['citas'], 'readwrite');
       let objectStore = transaction.objectStore('citas');

       // console.log(objectStore); 
       let peticion = objectStore.add(nuevaCita);

       console.log(peticion);

       peticion.onsuccess=() =>{
           form.reset();
       }
       transaction.oncomplete = ()=>{
           console.log('Cita agregada ');
           mostraCitas(); 
       }
       transaction.onerror = () =>{
           console.log('Hubo un error!');
       }

    }
    function mostraCitas(){
        // limpiar la citas anteriores  lo remueve desde mas arriva y creando un <li> para ver si se limpia
        while (citas.firstChild)  {
            citas.removeChild(citas.firstChild);
        }
        
        // creamos un objecstore
        let objectStore = DB.transaction('citas').objectStore('citas');

        // eesto retorna una peticion
        objectStore.openCursor().onsuccess = function(e){
            // cursor se va a ubicar en el registro indicando para acceder a los datos
            let cursor = e.target.result;
            //console.log(cursor); // muestra el resultado y las citas agregadas
            
            // una CONSULTA PARA mostrar en INDEXdDB
            if(cursor){
                let citaHTML = document.createElement('li');
                citaHTML.setAttribute( 'data-cita-id', cursor.value.key); //  nos trae el KEY unico  
                citaHTML.classList.add('list-group-item');

                citaHTML.innerHTML = `
                    <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
                    <p class="font-weight-bold">Cliente: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
                    <p class="font-weight-bold">Telefono: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
                    <p class="font-weight-bold">Fecha: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
                    <p class="font-weight-bold">Hora: <span class="font-weight-normal">${cursor.value.hora}</span></p>
                    <p class="font-weight-bold">Sintomas: <span class="font-weight-normal">${cursor.value.sintomas}</span></p>
                
                `;
                // boton de borrar 
                const botonBorrar = document.createElement('button');
                botonBorrar.classList.add('borrar','btn', 'btn-danger');
                botonBorrar.innerHTML='<span aria-hidden"true">x</span> Borrar';
                botonBorrar.onclick = borrarCita;
                citaHTML.appendChild(botonBorrar);

                // append en el padre
                citas.appendChild(citaHTML);
                // consulta los proximos registros
                cursor.continue();
            }else{
                if(!citas.firstChild){
                // cuando no hay registros
                headingAdministra.textContent = 'Agregar citas para comenzar ';
                let listado = document.createElement('p');
                listado.classList.add('text-center');
                listado.textContent = 'No hay registros';
                citas.appendChild(listado);

            
                } else {
                headingAdministra.textContent = 'Administra tus citas';
                }
        }   }
    }
    function borrarCita(e){ // obtenemos el id q quiero eliminar
       // console.log(e.target.parentElement.getAttribute('data-cita-id'));// muestra la id que se esta borrando de los datos guardados
        let citaID = e.target.parentElement.getAttribute('data-cita-id');
    }

    function borrarCita(e){
        let citaID = Number(e.target.parentElement.getAttribute('data-cita-id'));
       // en indexdDB se utilizan las transacciones.  mandando al INDEXdDB
       let transaction = DB.transaction(['citas'], 'readwrite');
       let objectStore = transaction.objectStore('citas');

       // console.log(objectStore); 
       let peticion = objectStore.delete(citaID);

       transaction.oncomplete = () =>{
           e.target.parentElement.parentElement.removeChild(e.target.parentElement);
           console.log(`se elimino la cita con el ID: ${citaID}`);


           if(!citas.firstChild){
            // cuando no hay registros
            headingAdministra.textContent = 'Agregar citas para comenzar ';
            let listado = document.createElement('p');
            listado.classList.add('text-center');
            listado.textContent = 'No hay registros';
            citas.appendChild(listado);

        
            } else {
            headingAdministra.textContent = 'Administra tus citas';
            }

       }

    }



})
