async function sendDebtNotification(telefono, userId) {
    try {
        const response = await fetch('/users/send-debt-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ telefono, userId })
        });

        if (response.ok) {
            alert('Notificación de deuda enviada exitosamente.');
        } else {
            alert('Error al enviar la notificación de deuda.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar la notificación de deuda.');
    }
}


document.addEventListener("DOMContentLoaded", function() {
  const actionButtons = document.querySelectorAll(".btn-group .btn-primary.dropdown-toggle");

  actionButtons.forEach(button => {
      button.addEventListener("click", function() {
          const userId = this.closest('tr').querySelector('td:first-child').textContent.trim();
          verDeudas(userId);
      });
  });
});

function verDeudas(userId) {
  // Aquí va la lógica para ver deudas
  console.log("Ver deudas del usuario con ID: " + userId);
  // Redirige o realiza alguna acción con el ID del usuario
  window.location.href = `/user/${userId}/debts`;
}




document.addEventListener('DOMContentLoaded', function() {
// Verificar si hay un userId almacenado en el localStorage
const storedUserId = localStorage.getItem('selectedUserId');
if (storedUserId) {
  verDeudas(storedUserId); // Llamar a la función verDeudas con el ID almacenado
}

const tipoDocumentoSelect = document.getElementById('tipoDocumento');
const numeroSerieInput = document.getElementById('numeroSerie');
const numeroDocumentoInput = document.getElementById('numeroDocumento');
const formDeuda = document.getElementById('formDeuda');

// Inicializa el campo número de documento al cargar la página
updateNumeroDocumento();

tipoDocumentoSelect.addEventListener('change', updateNumeroDocumento);
formDeuda.addEventListener('submit', saveAndIncrementDocumento);

// Vincula la función toggleAdditionalFields al evento de cambio del desplegable 'metodo'
const metodoSelect = document.getElementById('metodo');
metodoSelect.addEventListener('change', toggleAdditionalFields);

function updateNumeroDocumento() {
  const tipoDocumento = tipoDocumentoSelect.value;
  const lastNumero = localStorage.getItem(`ultimoNumero_${tipoDocumento}`) || '0001';
  numeroDocumentoInput.value = lastNumero;
  numeroSerieInput.value = tipoDocumento === 'recibo' ? '0001' : 'EB01';
}

function saveAndIncrementDocumento(event) {
  event.preventDefault();
  const tipoDocumento = tipoDocumentoSelect.value;
  const currentNumero = numeroDocumentoInput.value;
  
  // Guardar el último número de documento para el tipo seleccionado
  localStorage.setItem(`ultimoNumero_${tipoDocumento}`, padNumber(Number(currentNumero) + 1, 4));
  
  // Incrementar el número de documento
  const newNumero = padNumber(Number(currentNumero) + 1, 4);
  numeroDocumentoInput.value = newNumero;

  // Enviar el formulario
  formDeuda.submit();
}

function padNumber(num, size) {
  let s = num.toString();
  while (s.length < size) s = "0" + s;
  return s;
}

function toggleAdditionalFields() {
  const metodo = metodoSelect.value; // Utiliza metodoSelect aquí
  const additionalFields = document.getElementById('additionalFields');
  const codOperacion = document.getElementById('cod_operacion');

  if (metodo === 'cuentaGiga') {
    additionalFields.style.display = 'flex';
    codOperacion.value = '194-06210237-0-66';
  } else {
    additionalFields.style.display = 'none';
    // Establece los valores de los campos ocultos en null cuando no se muestran
    document.getElementById('banco').value = null;
    document.getElementById('forma').value = null;
    codOperacion.value = '';
    document.getElementById('cod_cuenta').value = '';
    document.getElementById('observacion').value = '';
  }
}
});

async function verDeudas(userId) {
try {
  localStorage.setItem('selectedUserId', userId); // Almacenar el userId seleccionado en el localStorage
  const response = await fetch(`/user-debts/${userId}`);
  const deudas = await response.json();
  mostrarDeudas(deudas, userId);
  mostrarFormularioDeuda(userId); // Mostrar el formulario al ver las deudas
 
} catch (error) {
  console.error('Error al obtener las deudas del usuario:', error);
}
}

function mostrarDeudas(deudas, userId) {
const deudasTableBody = document.getElementById('deudasTableBody');
deudasTableBody.innerHTML = '';

deudas.forEach(deuda => {
  if (parseFloat(deuda.deuda) !== 0) { // Verificar si el monto de la deuda es diferente de 0
    const row = document.createElement('tr');
    const fechaFormateada = new Date(deuda.fecha_deuda).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const fechaCorteFormateada = deuda.fecha_corte ? new Date(deuda.fecha_corte).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ' ';
    const deudaFormateada = parseFloat(deuda.deuda).toFixed(1);
    row.innerHTML = `
      <td>${fechaFormateada}</td>
      <td>${deuda.mes_deuda}</td>
      <td>${deudaFormateada}</td>
      <td>${deuda.tipo_deuda}</td>
      <td>${fechaCorteFormateada}</td> <!-- Nueva columna para fecha de corte -->
      <td><a class="btn btn-deudas" href="/user/${userId}/debts" style="background-color: red; border-color: red; color: white;">Corregir Deuda</a></td> <!-- Nueva columna para acciones -->
      
    `;
    deudasTableBody.appendChild(row);
  }
});
}


async function mostrarFormularioDeuda(userId) {
try {
  // Mostrar el contenedor del formulario
  document.getElementById('formularioDeudaContainer').style.display = 'block';
  // Asignar el userId al campo oculto del formulario
  document.getElementById('formUserId').value = userId;

  // Obtener los datos de servicios del usuario
  const response = await fetch(`/user-services/${userId}`); // Endpoint ficticio, reemplázalo con el correcto
  const servicios = await response.json();

  console.log(servicios); // Verifica si los datos se reciben correctamente

  // Rellenar los campos del formulario con los datos de servicios
  document.getElementById('apellidos').textContent = servicios.apellidos;
  document.getElementById('nombres').textContent = servicios.nombres;
  document.getElementById('direccion').textContent = servicios.direccion;
  document.getElementById('dni').textContent = servicios.dni;
  document.getElementById('deuda_total').textContent = servicios.deuda_total;

  // Rellenar el estado de los servicios
  const estadoServiciosList = document.getElementById('estadoServicios');
  estadoServiciosList.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos

  if (servicios.estado_cable === 'Bt') {
    const estadoCableItem = document.createElement('li');
    estadoCableItem.innerHTML = `<strong>CATV:</strong> ${servicios.estado_cable} - ${new Date(servicios.corte_cable).toLocaleDateString('es-ES')}`;
    estadoServiciosList.appendChild(estadoCableItem);
  } else if (servicios.estado_cable === 'Act') {
    const estadoCableItem = document.createElement('li');
    estadoCableItem.innerHTML = `<strong>CATV:</strong> ${servicios.estado_cable}`;
    estadoServiciosList.appendChild(estadoCableItem);
  }

  if (servicios.estado_internet === 'Bt') {
    const estadoInternetItem = document.createElement('li');
    estadoInternetItem.innerHTML = `<strong>INTERNET:</strong> ${servicios.estado_internet} - ${new Date(servicios.corte_internet).toLocaleDateString('es-ES')}`;
    estadoServiciosList.appendChild(estadoInternetItem);
  } else if (servicios.estado_internet === 'Act') {
    const estadoInternetItem = document.createElement('li');
    estadoInternetItem.innerHTML = `<strong>INTERNET:</strong> ${servicios.estado_internet}`;
    estadoServiciosList.appendChild(estadoInternetItem);
  }
} catch (error) {
  console.error('Error al mostrar el formulario de deuda:', error);
}

toggleAdditionalFields()
}


function toggleAdditionalButtons(userId) {
  const botonesAdicionalesDiv = document.getElementById(`botones-adicionales-${userId}`);
  if (botonesAdicionalesDiv.style.display === "none") {
      botonesAdicionalesDiv.innerHTML = ''; // Limpiar el contenido antes de agregar botones

      // Función para agregar botones al contenedor
      function agregarBoton(contenedor, texto, url) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.className = 'dropdown-item btn btn-warning';
          a.href = url;
          a.textContent = texto;
          li.appendChild(a);
          contenedor.appendChild(li);
      }

      // Agregar botones adicionales al contenedor
      agregarBoton(botonesAdicionalesDiv, "Agregar Internet", `/servicios/actualizarInt/${userId}`);
      agregarBoton(botonesAdicionalesDiv, "Agregar Cable", `/servicios/actualizar/${userId}`);
      agregarBoton(botonesAdicionalesDiv, "Actualizar señal CATV", `/servicios/actualizar1/${userId}`);
      agregarBoton(botonesAdicionalesDiv, "Actualizar Datos Usuario", `/users/actualizarDatos/${userId}`);
      agregarBoton(botonesAdicionalesDiv, "Actualizar Velocidad", `/servicios/actualizarVEL/${userId}`);
      
      botonesAdicionalesDiv.style.display = "block"; // Mostrar el contenedor
  } else {
      botonesAdicionalesDiv.style.display = "none"; // Ocultar el contenedor si ya está visible
  }
}






document.addEventListener("DOMContentLoaded", function() {
    // Select all update buttons
    const updateButtons = document.querySelectorAll("[id^=btn-actualizar-]");

    updateButtons.forEach(button => {
        button.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent default behavior of the link

            const userId = this.getAttribute("data-user-id"); // Get user ID from data attribute
            const contenedorBotones = document.getElementById(`botones-adicionales-${userId}`);

            // Remove existing buttons before adding new ones
            contenedorBotones.innerHTML = "";

            // Add three additional buttons with custom texts and routes
            agregarBoton(contenedorBotones, "Agregar Internet", `/servicios/actualizarInt/${userId}`);
            agregarBoton(contenedorBotones, "Agregar Cable", `/servicios/actualizar/${userId}`);
            agregarBoton(contenedorBotones, "Actualizar señal CATV", `/servicios/actualizar1/${userId}`);
            agregarBoton(contenedorBotones, "Actualizar Datos Usuario", `/users/actualizarDatos/${userId}`);
             agregarBoton(contenedorBotones, "Actualizar Velocidad", `/servicios/actualizarVEL/${userId}`);
        });
    });

    // Function to add button to the container
    function agregarBoton(container, text, route) {
        const newButton = document.createElement("a");
        newButton.textContent = text;
        newButton.href = route; // Assign route to the button
        newButton.classList.add("btn", "btn-secondary"); // Add Bootstrap classes as needed
        container.appendChild(newButton);
    }
}); 




function sendPlayerMessage(telefono, usuario, contrasena, tipo_servicio2) {
  if (!telefono) {
      telefono = prompt("Ingrese el número de teléfono:");
      if (!telefono) return;
  }

  let message = `Estimado cliente, aquí tiene sus datos de wifi ${tipo_servicio2}:\n\nUsuario: ${usuario}\nContraseña: ${contrasena}`;

  const whatsappLink = `https://wa.me/${telefono}?text=${encodeURIComponent(message)}`;
  const windowOptions = 'width=200,height=200,top=100,left=100';
  window.open(whatsappLink, "_blank", windowOptions);
}


function sendPlayerWithDebts(telefono, userId) {
  const deudasTableBody = document.getElementById('deudasTableBody');
  const deudasRows = deudasTableBody.querySelectorAll('tr');
  
  let message = `Estimado cliente,\nEstas son las deudas pendientes, pague pronto y evite cortes y costos de reconexión:\n`;

  deudasRows.forEach(row => {
      const fechaDeuda = row.cells[0].textContent;
      const mesDeuda = row.cells[1].textContent;
      const deuda = row.cells[2].textContent;
      const tipoDeuda = row.cells[3].textContent;
      const fechaCorte = row.cells[4].textContent;
      
      message += `\nFecha de Deuda: ${fechaDeuda}\nMes de Deuda: ${mesDeuda}\nDeuda: ${deuda}\nTipo de Deuda: ${tipoDeuda}\n\n`;
  });

  const whatsappLink = `https://wa.me/${telefono}?text=${encodeURIComponent(message)}`;
  const newWindow = window.open(whatsappLink, "_blank", 'width=500,height=600,top=100,left=100');
  
  // Simula el Enter después de un breve retraso
  setTimeout(() => {
      newWindow.document.execCommand('send', false, null);
  }, 3000); // Ajusta el tiempo según sea necesario
}






function sendPlayerWithDebts2(telefono, userId) {
  // Obtener las filas de la tabla de deudas
  const deudasTableBody = document.getElementById('deudasTableBody');
  const deudasRows = deudasTableBody.querySelectorAll('tr');
  
  // Crear el mensaje con las deudas del usuario
  let message = `Estimado cliente,\nSu servicio se a cortado por mantener deudas pendientes de:\n`;

  deudasRows.forEach(row => {
      const fechaDeuda = row.cells[0].textContent;
      const mesDeuda = row.cells[1].textContent;
      const deuda = row.cells[2].textContent;
      const tipoDeuda = row.cells[3].textContent;
      const fechaCorte = row.cells[4].textContent;
      
      message += `\nFecha de Deuda: ${fechaDeuda}\nMes de Deuda: ${mesDeuda}\nDeuda: ${deuda}\nTipo de Deuda: ${tipoDeuda}\n\n`;
  });

  // Abrir un enlace de WhatsApp con el mensaje
  const whatsappLink = `https://wa.me/${telefono}?text=${encodeURIComponent(message)}`;
  const windowOptions = 'width=200,height=200,top=100,left=100';
  window.open(whatsappLink, "_blank", windowOptions);
}



 $(document).ready(function() {
  const tablaContainer = $('#tablaContainer');
  const searchInput = $('#searchInput');

  // Función para verificar el campo de búsqueda y mostrar u ocultar la tabla
  function toggleTableVisibility() {
    if (searchInput.val().trim() === '') {
      tablaContainer.hide(); // Oculta la tabla si el campo de búsqueda está vacío
    } else {
      tablaContainer.show(); // Muestra la tabla si se ingresa un término de búsqueda
    }
  }

  // Oculta la tabla al cargar la página si el campo de búsqueda está vacío inicialmente
  toggleTableVisibility();

  // Detecta cambios en el campo de búsqueda y llama a la función para mostrar u ocultar la tabla
  searchInput.on('keyup', function() {
    toggleTableVisibility();
  });
});



