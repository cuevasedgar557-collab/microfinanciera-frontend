let clientePrestamoId = null;
let clientePrestamoExistenteId = null;
let clienteActual = null;
let clientesCache = [];
let prestamoActivoId = null;
let clienteEditandoId = null;
let barrioSeleccionadoId = null;
let estadoClientesCache = {};


//botones//
document.getElementById("btnPrestamo").addEventListener("click", asignarPrestamo);
document.getElementById("btnPrestamoExistente")?.addEventListener("click", agregarPrestamoExistente);
document.getElementById("btnGuardar").addEventListener("click", () => {
  if (clienteEditandoId) {
    actualizarCliente(clienteEditandoId);
  } else {
    guardarCliente();
  }
});

function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec =>
    sec.classList.remove("activa")
  );

  document.getElementById(id).classList.add("activa");

  // Clientes
  if (id === "clientes") {
  cargarClientes();

  const municipioId = document.getElementById("municipio").value;

  if (municipioId) {
    cargarBarrios(municipioId);
  }
}
  // ✅ HISTORIAL (AQUÍ ESTABA EL PROBLEMA)
  if (id === "historial") {
    const cont = document.getElementById("listaHistorial");

    if (!clienteActual) {
      cont.innerHTML = "<p>Selecciona un cliente primero.</p>";
      return;
    }

    cargarHistorialPrestamos(clienteActual.id);
  }

  // Clientes frecuentes
  if (id === "frecuentes") {
    cargarClientesFrecuentes();
  }
  // Usuarios
  if (id === "adminUsuarios") {
  cargarUsuarios();
}
// recordatorios
if (id === "recordatorios") {
  cargarRecordatorios("hoy");
}
if (id === "adminBarrios") {
  cargarDepartamentosBarrio();
  cargarBarriosAdmin();
}


const menu = document.querySelector(".menu");
  if (menu) {
    menu.classList.remove("open");
  }

}

function volverAClientes() {
  mostrarSeccion("clientes");
}

document.getElementById("nombrePrestamo").addEventListener("input", function () {
  const valor = this.value.trim();
  clientePrestamoId = null;

  const opciones = document
    .getElementById("listaNombres")
    .options;

  for (let opcion of opciones) {
    if (opcion.value === valor) {
      clientePrestamoId = opcion.dataset.id;
      break;
    }
  }
});

document.getElementById("nombrePrestamoExistente").addEventListener("input", function () {
  const valor = this.value.trim();
  clientePrestamoExistenteId = null;

  const opciones = document
    .getElementById("listaNombres")
    .options;

  for (let opcion of opciones) {
    if (opcion.value === valor) {
      clientePrestamoExistenteId = opcion.dataset.id;
      break;
    }
  }
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

const btnCrearUsuario = document.getElementById("btnCrearUsuario");
if (btnCrearUsuario) {
  btnCrearUsuario.addEventListener("click", crearUsuario);
}

function crearUsuario() {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre: document.getElementById("nombreUsuario").value,
      usuario: document.getElementById("usuarioNuevo").value,
      password: document.getElementById("passwordNuevo").value,
      rol_id: document.getElementById("rolUsuario").value
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      cargarUsuarios();
    });
}

function cargarUsuarios() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const datosUsuario = obtenerDatosUsuarioDesdeToken();
  if (!datosUsuario || datosUsuario.rol !== "administrador") return;

  fetch(`${API_URL}/api/usuarios`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data)) return;

      const lista = document.getElementById("listaUsuarios");
      lista.innerHTML = "";

      data.forEach(u => {
        const li = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = u.nombre;

        li.appendChild(strong);
        li.appendChild(document.createTextNode(` (${u.usuario}) - ${u.rol}`));
        lista.appendChild(li);
      });
    })
    .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", () => {
  const datosUsuario = obtenerDatosUsuarioDesdeToken();
  if (!datosUsuario) return;

  // Mostrar dashboard como pantalla principal
  mostrarSeccion("dashboard");

  // 🔒 Ocultar botón "Usuarios" si NO es admin
  if (datosUsuario.rol !== "administrador") {
    const btnUsuarios = document.querySelector(
      "button[onclick=\"mostrarSeccion('adminUsuarios')\"]"
    );

    if (btnUsuarios) {
      btnUsuarios.style.display = "none";
    }
  }
});
function toggleMenu() {
  document.querySelector('.menu').classList.toggle('open');
}

document.getElementById("departamento").addEventListener("change", e => {
  const departamentoId = e.target.value;

  // ✅ limpiar municipios
  document.getElementById("municipio").innerHTML =
    "<option value=''>Seleccione municipio</option>";

  // ✅ limpiar barrios (CLAVE)
  const datalist = document.getElementById("listaBarrios");
  if (datalist) datalist.innerHTML = "";

  const inputBarrio = document.getElementById("barrioInput");
  if (inputBarrio) inputBarrio.value = "";

  barrioSeleccionadoId = null;

  if (!departamentoId) return;

  cargarMunicipios(departamentoId);
});


//registro de los datos del cliente
function abrirRegistroCliente() {
  document.getElementById("fichaCliente").style.display = "none";
  document.getElementById("registroCliente").style.display = "block";
   cargarRegistroCliente();
}

function volverAFichaCliente() {
  document.getElementById("registroCliente").style.display = "none";
  document.getElementById("fichaCliente").style.display = "block";
}
function cargarRegistroCliente() {
  // ⚠️ POR AHORA DATOS DE EJEMPLO
  // luego estos vendrán del backend

  document.getElementById("regPrestamos").textContent = "3";
  document.getElementById("regCuotasMora").textContent = "4";
  document.getElementById("regMaxDias").textContent = "12";
  document.getElementById("regEvaluacion").textContent =
    "🟠 Cliente frecuente con mora moderada";

  const historial = document.getElementById("registroHistorial");
  historial.innerHTML = "";

  historial.innerHTML += `
    <h3>Préstamo #1</h3>
    <p>Mora: ✅ Sin mora</p>
    <hr>
  `;

  historial.innerHTML += `
    <h3>Préstamo #2</h3>
    <p>Cuotas atrasadas: 2</p>
    <ul>
      <li>Cuota 3 → 10 días</li>
      <li>Cuota 4 → 6 días</li>
    </ul>
    <hr>
  `;
}


document.getElementById("barrioInput").addEventListener("input", function () {
  const valor = this.value;
  barrioSeleccionadoId = null;

  const opciones = document.getElementById("listaBarrios").options;

  for (let opcion of opciones) {
    if (opcion.value === valor) {
      barrioSeleccionadoId = opcion.dataset.id;
      break;
    }
  }
});


document.getElementById("fiadorDepartamento").addEventListener("change", e => {
  const departamentoId = e.target.value;

  const municipioSelect = document.getElementById("fiadorMunicipio");
  municipioSelect.innerHTML = "<option value=''>Seleccione municipio</option>";

  if (!departamentoId) return;

  cargarMunicipios(departamentoId, "fiadorMunicipio");
});


cargarClientes();

