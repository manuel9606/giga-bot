function actualizarPrecio() {
    var select = document.getElementById("velocidad");
    var precioSeleccionado = select.options[select.selectedIndex].getAttribute("data-precio");
    document.getElementById("precio2").value = precioSeleccionado || "0";
  }


  function showSecondForm() {
    document.getElementById('firstForm').classList.add('hidden');
    document.getElementById('secondForm').classList.remove('hidden');
    document.getElementById('thirdForm').classList.add('hidden');
}

function showThirdForm() {
  
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

    for (var i = 1; i <= numDecos; i++) {
        var cardLabel = document.createElement('label');
        cardLabel.setAttribute('for', 'card_number_' + i);
        cardLabel.innerText = 'Card Number ' + i + ':';
        decosContainer.appendChild(cardLabel);

        var cardInput = document.createElement('input');
        cardInput.setAttribute('name', 'card_number_' + i);
        cardInput.setAttribute('id', 'card_number_' + i);
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
        decosContainer.appendChild(stbInput);

        var breakElement2 = document.createElement('br');
        decosContainer.appendChild(breakElement2);

        var stbLabel = document.createElement('label');
        stbLabel.setAttribute('for', 'nro_deco_' + i);
        stbLabel.innerText = 'Nro Deco ' + i + ':';
        decosContainer.appendChild(stbLabel);

        var stbInput = document.createElement('input');
        stbInput.setAttribute('name', 'nro_deco_' + i);
        stbInput.setAttribute('id', 'nro_deco_' + i);
        decosContainer.appendChild(stbInput);

        var breakElement2 = document.createElement('br');
        decosContainer.appendChild(breakElement2);

    }
}

function validarFechaInstalacion() {
    const fechaInstalacion = document.getElementById('fecha_instalacion').value;
    const fechaActual = new Date();

    if (new Date(fechaInstalacion) > fechaActual) {
        alert('La fecha de instalación no puede ser mayor que la fecha actual.');
        return false; // Detener el envío del formulario
    }

    return true; // Continuar con el envío del formulario
}

function mostrarNodo() {
    const direccion = document.getElementById('direccion').value.toLowerCase();
    let nodo = document.getElementById('nodo');

    if (direccion.includes('sec 6')) {
        nodo.value = 'nodo 1';
    } else if (direccion.includes('sec 7')) {
        nodo.value = 'nodo 2';
    } else if (direccion.includes('sec 8')) {
        nodo.value = 'nodo 3';
    } else if (direccion.includes('sec 9')) {
        nodo.value = 'nodo 4';
    } else {
        nodo.value = '';
    }
}


function actualizarMensualidad() {
    const tipoServicio = document.getElementById('tipo_servicio').value;
    const senal = document.getElementById('senal').value;
    const decos = document.getElementById('num_decos').value;

    let mensualidad = 0;

    if (tipoServicio === 'Basico') {
        mensualidad = 50.0;
    } else if (tipoServicio === 'Comercio') {
        mensualidad = 35.0;
    }

    if (decos == 2) { // Si hay 2 decodificadores, ajustar el precio a 50
        mensualidad = 50.0;
    } else if (decos == 1) { // Si hay 1 decodificador, ajustar el precio a 35
        mensualidad = 35.0;
    } else if (senal === 'Digital' && decos > 2) {
        mensualidad += (decos - 2) * 12.0;
    }

    document.getElementById('precio').value = mensualidad.toFixed(2);
}