/****************************************************
 * ADMINISTRAR BARRIOS
 ****************************************************/

/**
 * Carga la lista de barrios en la sección Administrar Barrios
 */
function cargarBarriosAdmin() {
  fetch(`${API_URL}/api/barrios`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById("listaBarriosAdmin");
      if (!ul) return;

      ul.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        ul.innerHTML = "<li>No hay barrios registrados.</li>";
        return;
      }

      data.forEach(b => {
  const li = document.createElement("li");

  li.style.display = "flex";
  li.style.justifyContent = "space-between";
  li.style.alignItems = "center";

  const span = document.createElement("span");
  span.textContent = b.nombre;

  li.appendChild(span);

  const token = localStorage.getItem("token");
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // ✅ SOLO ADMIN VE EL BOTÓN
    if (payload.rol === "administrador") {
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️";
      btnEliminar.style.marginLeft = "10px";
      btnEliminar.style.backgroundColor = "#dc3545";
      btnEliminar.style.color = "white";
      btnEliminar.style.border = "none";
      btnEliminar.style.padding = "6px 10px";
      btnEliminar.style.borderRadius = "6px";
      btnEliminar.style.cursor = "pointer";

      btnEliminar.onclick = () => eliminarBarrio(b.id);

      li.appendChild(btnEliminar);
    }
  }

  ul.appendChild(li);
});
    })
    .catch(err => {
      console.error("Error cargando barrios admin:", err);
    });
}


/**
 * Crea un nuevo barrio desde el panel admin
 */
function crearBarrioAdmin() {
  const input = document.getElementById("nuevoBarrio");
  if (!input) return;

  const nombre = input.value.trim();
  const municipioId = document.getElementById("municipioBarrio").value;

  if (!nombre) {
    alert("Escribe el nombre del barrio");
    return;
  }

  if (!municipioId) {
    alert("Selecciona un municipio");
    return;
  }

  fetch(`${API_URL}/api/barrios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({
      nombre,
      municipio_id: municipioId
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Error creando barrio");
      return res.json();
    })
    .then(() => {
      input.value = "";

      // ✅ refresca lista admin
      cargarBarriosAdmin();

      // ✅ 🔥 CLAVE: refrescar automáticamente el select de clientes
      if (typeof cargarBarrios === "function") {
        cargarBarrios(municipioId);
      }
    })
    .catch(err => {
      console.error("Error creando barrio:", err);
      alert("Error al crear barrio ❌");
    });
}
//crear barrio admin//
function cargarDepartamentosBarrio() {
  const select = document.getElementById("departamentoBarrio"); // ✅ CORREGIDO
  if (!select) return;

  fetch(`${API_URL}/api/departamentos`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Error cargando departamentos");
      return res.json();
    })
    .then(data => {
      select.innerHTML = '<option value="">Seleccione departamento</option>';

      data.forEach(d => {
        const option = document.createElement("option");
        option.value = d.id;
        option.textContent = d.nombre;
        select.appendChild(option);
      });
    })
    .catch(err => {
      console.error("Error departamentos:", err);
    });
}
document.addEventListener("DOMContentLoaded", () => {
  const selectDepto = document.getElementById("departamentoBarrio");
  if (!selectDepto) return;

  selectDepto.addEventListener("change", e => {
    const departamentoId = e.target.value;

    const selectMunicipio = document.getElementById("municipioBarrio");
    selectMunicipio.innerHTML = '<option value="">Seleccione municipio</option>';

    if (!departamentoId) return;

    cargarMunicipiosBarrio(departamentoId);
  });
});


function cargarMunicipiosBarrio(departamentoId) {
  fetch(`${API_URL}/api/municipios/${departamentoId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Error cargando municipios");
      return res.json();
    })
    .then(data => {
      const select = document.getElementById("municipioBarrio");

      select.innerHTML = '<option value="">Seleccione municipio</option>';

      data.forEach(m => {
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

/****************************************************
 * CARGAR BARRIOS EN FORMULARIO DE CLIENTES
 * (usa el select id="barrio" del formulario)
 ****************************************************/
function cargarBarrios(municipioId, listaId = "listaBarrios") {
  const datalist = document.getElementById(listaId); 
  if (!datalist) return;

  if (!municipioId) return;

  fetch(`${API_URL}/api/barrios/municipio/${municipioId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Error cargando barrios");
      return res.json();
    })
    .then(data => {
      console.log("BARRIOS CARGADOS:", data);

      datalist.innerHTML = "";

      data.forEach(b => {
        const option = document.createElement("option");
        option.value = b.nombre;
        option.dataset.id = b.id;
        datalist.appendChild(option);
      });

      // ✅ refrescar input correcto
      const inputId = listaId === "listaBarrios"
        ? "barrioInput"
        : "fiadorBarrioInput";

      const input = document.getElementById(inputId);
      if (input) {
        input.dispatchEvent(new Event("input"));
      }
    })
    .catch(err => {
      console.error("Error barrios:", err);
    });
}

/****************************************************
 * EVENTOS DE NAVEGACIÓN (SIN TOCAR scripts.js)
 ****************************************************/
document.addEventListener("DOMContentLoaded", () => {
  // cuando entras a la sección Barrios
  const btnBarrios = document.querySelector(
    'button[onclick="mostrarSeccion(\'barrios\')"]'
  );

  if (btnBarrios) {
    btnBarrios.addEventListener("click", cargarBarriosAdmin);
  }

  // cuando entras a Clientes -> refresca select
  const btnClientes = document.querySelector(
    'button[onclick="mostrarSeccion(\'clientes\')"]'
  );

 if (btnClientes) {
  btnClientes.addEventListener("click", () => {
    const municipioId = document.getElementById("municipio").value;

    if (municipioId) {
      cargarBarrios(municipioId);
    }
  });
}
});
function eliminarBarrio(id) {
  const confirmar = confirm("¿Eliminar este barrio?");
  if (!confirmar) return;

  fetch(`${API_URL}/api/barrios/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    })
    .then(data => {
      alert(data.mensaje || "Barrio eliminado ✅");

      // ✅ refrescar lista
      cargarBarriosAdmin();
    })
    .catch(err => {
      console.error("Error eliminando barrio:", err);
      alert("Error eliminando barrio ❌");
    });
}
// ✅ CARGAR BARRIOS CUANDO CAMBIA MUNICIPIO (CLIENTES)
document.addEventListener("DOMContentLoaded", () => {
  const selectMunicipio = document.getElementById("municipio");

  if (selectMunicipio) {
    selectMunicipio.addEventListener("change", e => {
      const municipioId = e.target.value;

      if (!municipioId) return;

      cargarBarrios(municipioId); // ✅ formulario cliente
    });
  }

  // ✅ admin: cargar pendientes una sola vez
  cargarBarriosPendientes();
});

function cargarBarriosPendientes() {
  fetch(`${API_URL}/api/barrios/pendientes`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById("listaBarriosPendientes");
      if (!ul) return;

      ul.innerHTML = "";
      
      if (data.length === 0) {
        ul.innerHTML = "<li>No hay barrios pendientes ✅</li>";
          return;
          }


      data.forEach(b => {
        const li = document.createElement("li");

        const nombreSpan = document.createElement("span");
        nombreSpan.className = "barrio-pendiente";
        nombreSpan.textContent = `🟡 ${b.nombre}`;

        const actions = document.createElement("div");

        const btnAprobar = document.createElement("button");
        btnAprobar.className = "btn-aprobar";
        btnAprobar.textContent = "Aprobar ✅";
        btnAprobar.onclick = () => aprobarBarrio(b.id);

        const btnEliminar = document.createElement("button");
        btnEliminar.className = "btn-eliminar";
        btnEliminar.textContent = "Eliminar ❌";
        btnEliminar.onclick = () => eliminarBarrioPendiente(b.id);

        actions.appendChild(btnAprobar);
        actions.appendChild(btnEliminar);

        li.appendChild(nombreSpan);
        li.appendChild(actions);
        ul.appendChild(li);
        
      });
    });
}

function aprobarBarrio(id) {
  const confirmar = confirm("¿Aprobar este barrio?");

  if (!confirmar) return;

  fetch(`${API_URL}/api/barrios/aprobar/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(() => {
      cargarBarriosPendientes();
      cargarBarriosAdmin();
    });
}

function eliminarBarrioPendiente(id) {
  const confirmar = confirm("¿Eliminar este barrio pendiente?");

  if (!confirmar) return;

  fetch(`${API_URL}/api/barrios/pendientes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(() => {
      cargarBarriosPendientes();
      cargarBarriosAdmin();
    });
}
