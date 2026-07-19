
/**
 * Carga la lista de trabajos en la sección Administrar Trabajos
 */
function cargarTrabajosAdmin() {
  fetch(`${API_URL}/api/trabajos`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => {

      // ✅ ADMIN (lista UL)
      const ul = document.getElementById("listaTrabajosAdmin");
      if (ul) {
        ul.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
          ul.innerHTML = "<li>No hay trabajos registrados.</li>";
        } else {
          data.forEach(t => {
            const li = document.createElement("li");
            li.textContent = t.nombre;
            ul.appendChild(li);
          });
        }
      }

      // ✅ CLIENTE (select)
      const selectCliente = document.getElementById("trabajo");
      if (selectCliente) {
        selectCliente.innerHTML = "<option value=''>Seleccione trabajo</option>";

        data.forEach(t => {
          const option = document.createElement("option");
          option.value = t.id;
          option.textContent = t.nombre;
          selectCliente.appendChild(option);
        });
      }

      // ✅ FIADOR (select)
      const selectFiador = document.getElementById("fiadorTrabajo");
      if (selectFiador) {
        selectFiador.innerHTML = "<option value=''>Seleccione trabajo</option>";

        data.forEach(t => {
          const option = document.createElement("option");
          option.value = t.id;
          option.textContent = t.nombre;
          selectFiador.appendChild(option);
        });
      }

    })
    .catch(err => {
      console.error("Error cargando trabajos:", err);
    });
}


/**
 * Crea un nuevo trabajo desde el panel admin
 */
function crearTrabajoAdmin() {
  const input = document.getElementById("nuevoTrabajo");
  if (!input) return;

  const nombre = input.value.trim();

  if (!nombre) {
    mostrarToast("Escribe el nombre del trabajo", "warning");
    return;
  }

  fetch(`${API_URL}/api/trabajos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ nombre })
  })
    .then(res => res.json())
    .then(() => {
      input.value = "";
      cargarTrabajosAdmin();

      if (typeof cargarTrabajos === "function") {
        cargarTrabajos();
      }
    })
    .catch(err => {
      console.error("Error creando trabajo:", err);
    });
}

/****************************************************
 * CARGAR TRABAJOS EN FORMULARIO DE CLIENTES
 * (usa el select id="trabajo" del formulario)
 ****************************************************/
function cargarTrabajos() {
  const select = document.getElementById("trabajo");
  if (!select) return;

  fetch(`${API_URL}/api/trabajos`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => {
      select.innerHTML = '<option value="">Seleccione trabajo</option>';

      if (!Array.isArray(data)) {
        console.error("Respuesta inválida de trabajos:", data);
        return;
      }

      data.forEach(t => {
        const option = document.createElement("option");
        option.value = t.id;
        option.textContent = t.nombre;
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Error cargando trabajos en formulario:", err);
    });
}

/****************************************************
 * EVENTOS DE NAVEGACIÓN (SIN TOCAR scripts.js)
 ****************************************************/
document.addEventListener("DOMContentLoaded", () => {
  // cuando entras a la sección Trabajos
  const btnTrabajos = document.querySelector(
    'button[onclick="mostrarSeccion(\'adminTrabajos\')"]'
  );

  if (btnTrabajos) {
    btnTrabajos.addEventListener("click", cargarTrabajosAdmin);
  }

  // cuando entras a Clientes -> refresca select
  const btnClientes = document.querySelector(
    'button[onclick="mostrarSeccion(\'clientes\')"]'
  );

  if (btnClientes) {
    btnClientes.addEventListener("click", cargarTrabajos);
  }
});
