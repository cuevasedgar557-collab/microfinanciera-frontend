let clientePrestamoId = null;
let clientePrestamoExistenteId = null;
let clienteActual = null;
let clientesCache = [];
let prestamoActivoId = null;
let clienteEditandoId = null;
let barrioSeleccionadoId = null;
let estadoClientesCache = {};
let chartPrestamos = null;
let chartRecuperacion = null;
let resumenRegistroActual = null;
let ultimoHistorialPrestamos = null;

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

  const token = localStorage.getItem("token");

  // =========================
  // RESUMEN DEL CLIENTE
  // =========================
  fetch(
    `${API_URL}/api/clientes/${clienteActual.id}/registro`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then(res => res.json())
    .then(data => {

      resumenRegistroActual = data;

      document.getElementById("regPrestamos").textContent =
        data.prestamos_completados;

      document.getElementById("regActivos").textContent =
        data.prestamos_activos;

      document.getElementById("regTotalPrestado").textContent =
        `C$ ${Number(data.total_prestado).toLocaleString()}`;

      document.getElementById("regTotalRecuperado").textContent =
        `C$ ${Number(data.total_recuperado).toLocaleString()}`;

      document.getElementById("regCuotasMora").textContent =
        data.cuotas_atrasadas;

      document.getElementById("regMaxDias").textContent =
        `C$ ${Number(data.mora_total).toLocaleString()}`;

      document.getElementById("regEvaluacion").textContent =
        data.evaluacion;
        actualizarPerfilCrediticio(data);

      // ✅ Si el historial ya llegó, dibujar gráficos
      if (ultimoHistorialPrestamos) {

        renderizarGraficosRegistro(
          ultimoHistorialPrestamos,
          resumenRegistroActual
        );

      }

    })
    .catch(err => {
      console.error("Error cargando registro:", err);
    });

  // =========================
  // HISTORIAL DE PRÉSTAMOS
  // =========================
  fetch(
    `${API_URL}/api/prestamos/cliente/${clienteActual.id}/historial`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then(res => res.json())
    .then(prestamos => {

      ultimoHistorialPrestamos = prestamos;

      const historial =
        document.getElementById("registroHistorial");

      historial.innerHTML = "";

      if (!prestamos || prestamos.length === 0) {
        historial.innerHTML =
          "<p>No tiene préstamos finalizados.</p>";
        return;
      }

      prestamos.forEach(prestamo => {

        historial.innerHTML += `
          <div class="card">

            <h4>Préstamo #${prestamo.id}</h4>

            <p>
              <strong>Monto:</strong>
              C$ ${Number(prestamo.monto).toLocaleString()}
            </p>

            <p>
              <strong>Total a pagar:</strong>
              C$ ${Number(prestamo.total).toLocaleString()}
            </p>

            <p>
              <strong>Interés:</strong>
              ${Number(prestamo.interes).toFixed(2)}%
            </p>

            <p>
              <strong>Fecha inicio:</strong>
              ${new Date(prestamo.fecha_inicio).toLocaleDateString()}
            </p>

            <p>
              <strong>Estado:</strong>
              ✅ Finalizado
            </p>

          </div>
        `;
      });

      // ✅ Si el resumen ya llegó, dibujar gráficos
      if (resumenRegistroActual) {

        renderizarGraficosRegistro(
          prestamos,
          resumenRegistroActual
        );

      }

    })
    .catch(err => {
      console.error("Error cargando historial:", err);

      document.getElementById("registroHistorial").innerHTML =
        "<p>Error cargando historial.</p>";
    });

}

function renderizarGraficosRegistro(prestamos, resumen) {


  const canvasPrestamos =
    document.getElementById("graficoPrestamos");

  const canvasRecuperacion =
    document.getElementById("graficoRecuperacion");

  if (!canvasPrestamos || !canvasRecuperacion) return;

  if (chartPrestamos) {
    chartPrestamos.destroy();
  }

  if (chartRecuperacion) {
    chartRecuperacion.destroy();
  }

  chartPrestamos = new Chart(canvasPrestamos, {
    type: "bar",
    data: {
      labels: prestamos.map(p => `#${p.id}`),
      datasets: [{
        label: "Monto prestado",
        data: prestamos.map(p => Number(p.monto)),
        backgroundColor: "#2563eb"
      }]
    },
    options: {
      responsive: true
    }
  });

  chartRecuperacion = new Chart(canvasRecuperacion, {
    type: "doughnut",
    data: {
      labels: [
        "Prestado",
        "Recuperado"
      ],
      datasets: [{
        data: [
          Number(resumen.total_prestado),
          Number(resumen.total_recuperado)
        ],
        backgroundColor: [
          "#f59e0b",
          "#16a34a"
        ]
      }]
    },
    options: {
      responsive: true
    }
  });

}

function actualizarPerfilCrediticio(data) {

  let score = 50;

  score += data.prestamos_completados * 10;

  score -= data.cuotas_atrasadas * 5;

  score -= Math.floor(
    data.mora_total / 100
  );

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  let texto = "Regular";
  let color = "#f59e0b";

  if (score >= 80) {
    texto = "🟢 Excelente";
    color = "#16a34a";
  }
  else if (score >= 60) {
    texto = "🔵 Bueno";
    color = "#2563eb";
  }
  else if (score >= 40) {
    texto = "🟠 Regular";
    color = "#f59e0b";
  }
  else {
    texto = "🔴 Riesgoso";
    color = "#dc2626";
  }

  document.getElementById("scoreNivel")
    .style.width = `${score}%`;

  document.getElementById("scoreNivel")
    .style.backgroundColor = color;

  document.getElementById("scoreTexto")
    .textContent = `${texto} (${score}%)`;

  document.getElementById("perfilPrestado")
    .textContent =
    `C$ ${Number(data.total_prestado).toLocaleString()}`;

  document.getElementById("perfilRecuperado")
    .textContent =
    `C$ ${Number(data.total_recuperado).toLocaleString()}`;

  document.getElementById("perfilCompletados")
    .textContent =
    data.prestamos_completados;

  document.getElementById("perfilMora")
    .textContent =
    `C$ ${Number(data.mora_total).toLocaleString()}`;

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

