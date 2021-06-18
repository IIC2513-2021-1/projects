
/*   
  +-----------------------------------------------------------------------------------------------------------------------------------------+
  |  Se tienen dos "divs" o áreas en las que hay listas no ordenadas de elementos.                                                          |                                                                                                                                         |
  |                                                                                                                                         |
  |  - Se pueden agregar elementos a la lista de la izquierda.                                                                              |
  |  - Los elementos se pueden reordenar dentro de la lista                                                                                 | 
  |  - Los elementos se pueden mover entre listas (áreas)                                                                                   |
  |                                                                                                                                         |
  | ESTUDIE y practique con el código. Se entrega el css y el html. Al final de este archivo esta el EJERCICIO que se solicita              |
  | (algunos cambios y mejoras)                                                                                                             | 
  |                                                                                                                                         |
  +-----------------------------------------------------------------------------------------------------------------------------------------+

  */

var botonAgregar = document.querySelector('.nuevo');


function dragStart(evento) {
  this.className = evento.target.className
  this.id = evento.target.id
  this.style.opacity = '0.5';
  this.classList.add('liArrastrado');
  dragLiOriginal = this;
  evento.dataTransfer.effectAllowed = 'move';
  evento.dataTransfer.setData('text/html', this.innerHTML);
 }



// El evento de dragenter se gatilla cuando un elemento "arrastrado" pasa (entra) sobre un elemento sobre el cual se pueda soltar el elemento.
function dragEnter(evento) {
  this.classList.add('over'); //le entregamos la clase (css) de over
}



// Análogo al anterior, pero se gatilla cuando el elemento "abandona" la zona donde se puede soltar.
function dragLeave(evento) {

  evento.stopPropagation();  
  this.classList.remove('over');  //Lo sacamos de la case (css) de over
}





//El dragover se gatilla al momento que un elemento está siendo arrojado (soltado) sobre un área permitida.
function dragOver(evento) {

  // para evento.preventDefault(), ver la nota en evento.stopPropagation()

  evento.preventDefault();
  evento.dataTransfer.dropEffect = 'move';  // En este caso el efecto visual es que el elemento (li) Se mueve a la zona de lanzamiento.
  return false;
}



function dragDrop(evento) {
  
  // Este es el evento clave. Cuando se "suelta" el elemento capturado.
    
    let idOrigen   = dragLiOriginal.id  // Esta variable es entretenida, viene del dragStart y es el li original que "agarré"
    let elemOrigen = dragLiOriginal   
    let idUlOrigen = document.getElementById(idOrigen).parentElement.id;

    if (dragLiOriginal != this) {  // Ocurre que si el elemento (li) lo arrastro a sí mismo, no hago nada.

      if(this.id == idOrigen){  // Ocurre que estoy en el mismo ul
          
          dragLiOriginal.innerHTML = this.innerHTML;
          this.innerHTML = evento.dataTransfer.getData('text/html'); 

        } else if( this.id != idOrigen) {  // Ocurre que el ul es "otro ul", no el mismo de origen del elemento (li)
                
                idDestino = document.getElementById(this.id).parentElement.id;

                /* Acá se elimina el li desde el ul original. (ojo, no me puedo quedar sin "hijos" en el ul)
                   El elemento a eliminar tiene una clase especial que lo identifica.
                   Este truco ya lo habiamos utiliado. */

                var liArrastrado = document.getElementsByClassName("liArrastrado");
                liArrastrado.item(0).remove(); // Se elimina pues se movió el li de un ul a otro.

                // insertaLI es la función que crea un nuevo li para el ul al que fue arrastrado el elemento
                insertaLI(idDestino,this.classList[0], this.id, dragLiOriginal.innerHTML)

               }
    }

  return false;
}


//Todo el drag and drop ha concluido (se soltó el botón y el elemento "cayó")
function dragEnd(evento) {
 
  var listItems = document.querySelectorAll('li');
  [].forEach.call(listItems, function(item) {
    item.classList.remove('over'); // Se saca la clase (css) de over
    item.classList.remove('liArrastrado') //Esto es clave!, esta clase indica un elemento candidato a ser borrado.
  });

  this.style.opacity = '1'; //Recupera la "opacidad" original (estaba al 0.5)
 
}

function agregarListeners(elementoLI) {

  
  /* Al elemento LI se le agregan todos los listeners que tienen que ver con drag and drop.   
  
  +-----------------------------------------------------------------------------------------------------------------------------------------+
  | Todo eventlistener que se agrega tiene la siguiente estructura:                                                                         |                                                                                                                                         |
  |                                                                                                                                         |
  |  element.addEventListener(event, function, useCapture)                                                                                  |
  |                                                                                                                                         | 
  | event      : nombre del evento                                                                                                          |
  | function   : la funcion a invoc uando ocurra el evento.                                                                                 |
  | useCapture : indica la forma de propagacion en el HTML DOM API: "capturing" o "bubbling": true es para capturing, false para bubbling   |
  |                                                                                                                                         |
  +-----------------------------------------------------------------------------------------------------------------------------------------+
  
  ¿Qué significa esto? Al momento de gatillarse un evento y si hay más de un elemento anidado uno en otro (como div-ul-li) d´nde más de uno tiene
  el mismo evento registrado, el parámetro useCapture indica la forma de invocarlos.
  En el caso de false (bubbling) el evento gatillado se captura y adminsitra/maneja por el elemento más interno en esta anidación y luego se
  propaga hacia el elemento m+as externo.
  En el caso de true (capturing) ocurre a la inversa.

  */

// La descripción de cada listener está en sus funciones respectivas.

  elementoLI.addEventListener('drop', dragDrop, false);
  elementoLI.addEventListener('dragstart', dragStart, false);
  elementoLI.addEventListener('dragenter', dragEnter, false);
  elementoLI.addEventListener('dragover', dragOver, false);
  elementoLI.addEventListener('dragleave', dragLeave, false);
  elementoLI.addEventListener('dragend', dragEnd, false);
}

// Acá, el recien iniciar la página, a todos los li se les asignan los listeners.

var listItems = document.querySelectorAll('li');

[].forEach.call(listItems, function(varItem) {  // se usa call, lo recuerdan?
  agregarListeners(varItem);
} ) ;



// Función que se invoca al hacer click sobre el + y que agrega nuevo li (si es que tiene contenido)

function AgregarNuevoItem() {

  var textoDeItem = document.querySelector('.input').value;
  
  if (textoDeItem != '') {
    
    document.querySelector('.input').value = '';  // se limpia el input
    
    insertaLI('listaIzquierda','izquierda', 'izq', textoDeItem)
  }
}

function insertaLI(varUL,varClass, varID, varItem) {

    var ul   = document.getElementById(varUL);
    var li   = document.createElement('li');  // Siempre agregaremos un elemento li
    var attr = document.createAttribute('draggable');

    li.className = varClass;
    li.id = varID;
    attr.value = 'true';

    li.setAttributeNode(attr);
    li.appendChild(document.createTextNode(varItem));
    ul.appendChild(li);
    
    agregarListeners(li);  //Se le agregan todos los listeners
}

botonAgregar.addEventListener('click', AgregarNuevoItem);








/**************************************   EJERCICIO   **************************************

Modificaciones al programa:

Si se dieron cuenta, hay un truco que es no tener nunca una lista (UL) vacía (lo pueden ver en el panel de la derecha)
El truco es asociar un elemento (LI) vacío al UL para que el UL nunca queda vacío. Esto es porque el elemento "draggeable" 
es el LI y no el UL (ni el div)
La idea es que vean otra forma de hacer el drag and drop sin tener que usar el truco...

A) Si desean mantener el truco, hay que mejorarlo
   1.- Los elementos (LI) vacios deben tener un css que los "oculte" a la vista
   2.- El elemento (LI) vacio debe borrarse cuando se inserta el primer elemento al UL
   3.- Si el UL tiene un último elemento y va a ser movido al otro UL, entonces deben crear el elmento vacío para evitar que el UL
      quede sin ningun "child"

B.1) Agreguen un "+" (<usen span>) a la izquierda. Así pues, si se aprieta el + de la izquierda, se agega el item a la izquierda, si se
     apreta el de la derecha, se agerga al ul de la derecha (ahora hay uno solo a la derecha que inserta elemento LI a la izquierda)
B.2) Usen drag and drop para mandar elementos desde el input a alguno de los UL (listas) 
B.3) Creen un tercer panel, por lo tanto tendrán uno izquierdo, otro central y otro derecho. Creen css para cada panel
B.4) implementen drag and drop entre todos los paneles, respetando las reglas anteriores.

C) Agregar un listener que al doble click "borre" el elemento seleccionado (donde orurrió el doble click)
C.1) Implemente un botón "deshacer", un botón que recupere el último de los elementos borrados (pueden usar listas ocultas)

D) Implemente un boton guardar que permita grabar en Local Storage las listas y a los paneles que pertenece (recuerde UL tiene una clase)
D.1) Recuerde que al volver a cargar la página se debe recuperar automáticamente el contenido de todas las listas.

E) Implemente el botón Borrar que limpia todo (Se atreven a hacer un deshacer de eso?)

F) Creen elementos de estilo para los botones (que sean redondeados y con sombra y gradiente)
F.1) Usen mouse over, click, y otros.

G) re-hagan TODO usando JQUERY ----> Esto es optativo.

*******************************************************************************************/
