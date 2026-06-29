function limpiarFormulario() {
  document.getElementById("nombre").value = "";
  document.getElementById("cedula").value = "";
  document.getElementById("sexo").value = "";
  document.getElementById("telefono").value = "";
  document.getElementById("departamento").value = "";
  document.getElementById("municipio").innerHTML =
    '<option value="">Seleccione municipio</option>';
  document.getElementById("trabajo").value = "";
  const inputBarrio = document.getElementById("barrioInput");
  if (inputBarrio) inputBarrio.value = "";
    barrioSeleccionadoId = null;
  document.getElementById("direccion").value = "";
}

function mostrarMensaje(texto, color) {
    let mensaje = document.getElementById("mensaje");

    mensaje.textContent = texto;
    mensaje.style.color = color;

    setTimeout(() => {
        mensaje.textContent = "";
    }, 2000);
}
function formatearSoloFecha(fechaISO) {
  if (!fechaISO) return "";

  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

function formatearFechaHora(fechaISO) {
  if (!fechaISO) return "";

  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${anio} – ${horas}:${minutos}`;
}

function obtenerDatosUsuarioDesdeToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload; // aquí viene el rol
}

function cargarMunicipios(departamentoId, selectId = "municipio") {
  fetch(`${API_URL}/api/municipios/${departamentoId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Error cargando municipios");
      return res.json();
    })
    .then(municipios => {

      const select = document.getElementById(selectId);

      // ✅ LIMPIAR antes de llenar
      select.innerHTML = "<option value=''>Seleccione municipio</option>";

      municipios.forEach(m => {
        const option = document.createElement("option");
        option.value = m.id;
        option.textContent = m.nombre;
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Error municipios:", err);
    });
}
