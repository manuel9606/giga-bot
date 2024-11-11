
function mostrarNodo() {
    const direccionInput = document.getElementById('direccion');
    const mensaje = document.getElementById('mensaje');
    const value = direccionInput.value;

    const grRegex = /gr\s*(\d+)/i;
    const match = value.match(grRegex);

    if (match && parseInt(match[1], 10) >= 10) {
      mensaje.style.display = 'block';
    } else {
      mensaje.style.display = 'none';
    }
  }






function validarFormulario() {
  const estadoCable = document.getElementById('estado_cable').value;
  const servicio = document.getElementById('servicio').value;
  const senal = document.getElementById('senal').value;
  const tipoServicio = document.getElementById('tipo_servicio').value;
  const fechaInstalacion = document.getElementById('fecha_instalacion').value;
  
  
  


  // Verificar si alguno de los campos ya no tiene el valor "Seleccione..."
  if (estadoCable !== "" || servicio !== "" || senal !== "" || tipoServicio !== "") {
    // Si alguno es seleccionado, los demás campos deben ser obligatorios
    if (estadoCable === "") {
      alert("Por favor, seleccione el estado del cable.");
      return false;
    }
    if (servicio === "") {
      alert("Por favor, seleccione el servicio de cable.");
      return false;
    }
    if (senal === "") {
      alert("Por favor, seleccione la señal de cable.");
      return false;
    }
    if (tipoServicio === "") {
      alert("Por favor, seleccione el tipo de servicio de cable.");
      return false;
    }
    if (fechaInstalacion === "") {
      alert("Por favor, ingrese la fecha de instalación de  cable.");
      return false;
    }
  }

  // Si todo está bien, permitir el envío del formulario
  return true;
}




// Asignar la función de validación al evento submit
document.querySelector('form').onsubmit = validarFormulario;











function actualizarPrecio() {
  var select = document.getElementById("velocidad");
  var precioSeleccionado = select.options[select.selectedIndex].getAttribute("data-precio");
  document.getElementById("precio2").value = precioSeleccionado || "0";
}





function updateActivacionCable() {
  // Obtener el valor de fecha_instalacion
  const fechaInstalacion = document.getElementById('fecha_instalacion').value;

  // Asignar el mismo valor a activacion_cable
  document.getElementById('activacion_cable').value = fechaInstalacion;
}




function updateActivacionInternet() {
  // Obtener el valor de instalacion_int
  const fechaInscripcion = document.getElementById('instalacion_int').value;

  // Asignar el mismo valor a activacion_internet
  document.getElementById('activacion_internet').value = fechaInscripcion;
}





 function showSecondForm() {
          const direccion = document.getElementById('direccion').value;
          if (direccion) {
              verificarDireccion(direccion, (existe) => {
                  if (existe) {
                      document.getElementById('direccion-error').innerText = 'La dirección ya existe';
                  } else {
                      document.getElementById('firstForm').classList.add('hidden');
                      document.getElementById('secondForm').classList.remove('hidden');
                  }
              });
          } else {
              document.getElementById('direccion-error').innerText = 'Por favor, ingrese una dirección';
          }
      }

function showThirdForm() {
    document.getElementById('secondForm').classList.add('hidden');
    document.getElementById('thirdForm').classList.remove('hidden');
    document.getElementById('firstForm').classList.add('hidden');
}

function showFirstForm() {
    document.getElementById('secondForm').classList.remove('hidden');
    document.getElementById('firstForm').classList.remove('hidden');
    document.getElementById('thirdForm').classList.add('hidden');
}





      function generarEntradasDecos() {
          var numDecos = document.getElementById('num_decos').value;
          var decosContainer = document.getElementById('decos_container');
          decosContainer.innerHTML = ''; // Limpiar el contenedor

          if (numDecos > 0) {
              for (var i = 1; i <= numDecos; i++) {
                  var cardLabel = document.createElement('label');
                  cardLabel.setAttribute('for', 'card_number_' + i);
                  cardLabel.innerText = 'Card Number ' + i + ':';
                  decosContainer.appendChild(cardLabel);

                  var cardInput = document.createElement('input');
                  cardInput.setAttribute('name', 'card_number_' + i);
                  cardInput.setAttribute('id', 'card_number_' + i);
                  cardInput.setAttribute('value', '600600');
                  decosContainer.appendChild(cardInput);

                  var breakElement = document.createElement('br');
                  decosContainer.appendChild(breakElement);

                  var stbLabel = document.createElement('label');
                  stbLabel.setAttribute('for', 'STB_id_' + i);
                  stbLabel.innerText = 'STB ID ' + i + ':';
                  decosContainer.appendChild(stbLabel);

                  var stbInput = document.createElement('input');
                  stbInput.setAttribute('name', 'STB_id_' + i);
                  stbInput.setAttribute('id', 'STB_id_' + i);
                  stbInput.setAttribute('value', '2010');
                  decosContainer.appendChild(stbInput);

                  var breakElement2 = document.createElement('br');
                  decosContainer.appendChild(breakElement2);

                  var decoLabel = document.createElement('label');
                  decoLabel.setAttribute('for', 'nro_deco_' + i);
                  decoLabel.innerText = 'Nro Deco ' + i + ':';
                  decosContainer.appendChild(decoLabel);

                  var decoInput = document.createElement('input');
                  decoInput.setAttribute('name', 'nro_deco_' + i);
                  decoInput.setAttribute('id', 'nro_deco_' + i);
                  decoInput.setAttribute('value', '0');
                  decosContainer.appendChild(decoInput);

                  var breakElement3 = document.createElement('br');
                  decosContainer.appendChild(breakElement3);
              }
          }
      }







      function mostrarNodo() {
          const direccion = document.getElementById('direccion').value.toLowerCase();
          let nodo = document.getElementById('nodo');

          if (direccion.includes('sec 6 gr 1 ') || direccion.endsWith('sec 6 gr 1') || 
              direccion.includes('sec 6 gr 1a') || 
              direccion.includes('sec 6 gr 2 ') || direccion.endsWith('sec 6 gr 2') ||
              direccion.includes('sec 6 gr 2a') || 
              direccion.includes('sec 6 gr 3 ') || direccion.endsWith('sec 6 gr 3') ||
              direccion.includes('sec 6 gr 3a') || 
              direccion.includes('sec 6 gr 11') || 
              direccion.includes('asoc sjm')) {
              nodo.value = 'nodo 1';
          } else if (direccion.includes('sec 6 gr 4 ')  ||
                     direccion.includes('sec 6 gr 4a') || 
                     direccion.includes('sec 6 gr 5 ') ||
                     direccion.includes('sec 6 gr 5a')) {
              nodo.value = 'nodo A';
          } else if (direccion.includes('sec 6 gr 12') || direccion.includes('sec 6 gr 13')) {
              nodo.value = 'nodo B';
          } else if (direccion.includes('sec 6 gr 6') || 
                     direccion.includes('sec 6 gr 6a')) {
              nodo.value = 'nodo C';
          } else if (direccion.includes('sec 6 gr 9') || 
                     direccion.includes('sec 6 gr 10')) {
              nodo.value = 'nodo D';  
          } else if (direccion.includes('sec 6a gr 1')) {
              nodo.value = 'nodo E';  
          } else if (direccion.includes('vrg cand')  ||
                     direccion.includes('max uhle') || 
                     direccion.includes('20 de oct ')) {
              nodo.value = 'nodo 1B';
          } else if (direccion.includes('pachac b4')  ||
                     direccion.includes('qda') || 
                     direccion.includes('aires ')) {
              nodo.value = 'nodo 2';
          } else if (direccion.includes('pachac b3')) {
              nodo.value = 'nodo 3';
          } else if (direccion.includes('edil')  ||
                     direccion.includes('jrd') || 
                     direccion.includes('los laureles ')) {
              nodo.value = 'nodo 4';
          } else if (direccion.includes('sec 10 gr 1')  ||
                     direccion.includes('sec 10 gr 2') || 
                     direccion.includes('sec 10 gr 3 ')) {
              nodo.value = 'nodo 5';
          } else if (direccion.includes('sec 10 gr 3a')  ||
                     direccion.includes('sec 10 gr 4 ')) {
              nodo.value = 'nodo 6';
          } else if (direccion.includes('sec 9 gr 3')  ||
                     direccion.includes('sec 9 gr 4') || 
                     direccion.includes('sec 9 gr 5 ')) {
              nodo.value = 'nodo 7';
          } else if (direccion.includes('sec 7 gr 3')  ||
                     direccion.includes('sec 7 gr 3a ')) {
              nodo.value = 'nodo 8';   
          } else if (direccion.includes('sec 7 gr 1')  ||
                     direccion.includes('sec 7 gr 2a') || 
                     direccion.includes('sec 7 gr 2') || 
                     direccion.includes('sec 7 gr 1a ')) {
              nodo.value = 'nodo 9';   
          } else if (direccion.includes('sec 9 gr 1')  ||
                     direccion.includes('sec 9 gr 2 ')) {
              nodo.value = 'nodo 10';       
              
               } else if (direccion.includes('encantada')) {
              nodo.value = 'nodo 11';
          } else {
              nodo.value = 'nodo desconocido';
          }
      }











function actualizarMensualidad() {
  const tipoServicio = document.getElementById('tipo_servicio').value;
  const senal = document.getElementById('senal').value;
  const decos = parseInt(document.getElementById('num_decos').value); // Parsear a entero

  let mensualidad = 0;

  if (tipoServicio === 'Basico') {
      mensualidad = 50.0;
  } else if (tipoServicio === 'Comercio') {
      mensualidad = 35.0;
  }

  if (senal === 'Digital' && decos > 2) {
      mensualidad = 50.0 + (decos - 2) * 12.0; // Si es Digital y hay más de 2 decodificadores
  }

  document.getElementById('precio').value = mensualidad.toFixed(2);
}


     function verificarDireccion(direccion, callback) {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/verificar-direccion', true);
          xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
          xhr.onreadystatechange = function () {
              if (xhr.readyState === 4 && xhr.status === 200) {
                  const response = JSON.parse(xhr.responseText);
                  callback(response.existe);
              }
          };
          xhr.send(JSON.stringify({ direccion }));
      }



  