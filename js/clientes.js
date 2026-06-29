function guardarCliente() {
  const nombre = document.getElementById("nombre").value.trim();
  const cedula = document.getElementById("cedula").value.trim();
  const sexo = document.getElementById("sexo").value;
  const estadoSelect = document.getElementById("estadoCivil");
  const estado_civil = estadoSelect ? estadoSelect.value : null;
  const telefono = document.getElementById("telefono").value.trim();

  const departamento_id = document.getElementById("departamento").value || null;
  const municipio_id = document.getElementById("municipio").value || null;
  const trabajo_id = document.getElementById("trabajo").value || null;
  const barrio_id = barrioSeleccionadoId;
  const direccion = document.getElementById("direccion").value.trim();

  if (!nombre || !cedula || !sexo) {
    mostrarMensaje("Completa los campos obligatorios ❌", "red");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Sesión expirada, vuelve a iniciar sesión");
    return;
  }

  fetch(`${API_URL}/api/clientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre,
      cedula,
      sexo,
      telefono,
      departamento_id,
      municipio_id,
      trabajo_id,
      barrio_id,
      direccion,
      estado_civil
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    })
    .then(data => {
      mostrarMensaje("Cliente guardado correctamente ✅", "green");
      limpiarFormulario();
      cargarClientes(true);
    })
    .catch(err => {
      console.error(err);
      mostrarMensaje("Error al guardar cliente ❌", "red");
    });
}
function editarCliente(clienteId) {
  const cliente = clientesCache.find(c => c.id === clienteId);
  if (!cliente) return;

  // 🔹 Campos básicos
  document.getElementById("nombre").value = cliente.nombre;
  document.getElementById("cedula").value = cliente.cedula;
  document.getElementById("sexo").value = cliente.sexo || "";
  const estadoSelect = document.getElementById("estadoCivil");
  if (estadoSelect) {
  estadoSelect.value = cliente.estado_civil || "";
}
  document.getElementById("telefono").value = cliente.telefono || "";

  // 🔹 Relaciones
  document.getElementById("departamento").value = cliente.departamento_id || "";
  document.getElementById("municipio").value = cliente.municipio_id || "";
  document.getElementById("trabajo").value = cliente.trabajo_id || "";
  const inputBarrio = document.getElementById("barrioInput");
  if (inputBarrio) {
  inputBarrio.value = cliente.barrio || "";
  }
  // 🔹 Dirección
  document.getElementById("direccion").value = cliente.direccion || "";

  // 🔒 Activar modo edición
  clienteEditandoId = cliente.id;

  mostrarMensaje("Editando cliente...", "orange");
}
function actualizarCliente(clienteId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("No autorizado");
    return;
  }
  const estadoSelect = document.getElementById("estadoCivil");
  const estado_civil = estadoSelect ? estadoSelect.value : null;
  fetch(`${API_URL}/api/clientes/${clienteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre: document.getElementById("nombre").value.trim(),
      cedula: document.getElementById("cedula").value.trim(),
      sexo: document.getElementById("sexo").value,
      estado_civil,
      telefono: document.getElementById("telefono").value.trim(),
      departamento_id: document.getElementById("departamento").value || null,
      municipio_id: document.getElementById("municipio").value || null,
      trabajo_id: document.getElementById("trabajo").value || null,
      barrio_id: barrioSeleccionadoId,
      direccion: document.getElementById("direccion").value.trim()
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al actualizar");
      return res.json();
    })
    .then(() => {
      mostrarMensaje("Cliente actualizado correctamente ✅", "green");
      clienteEditandoId = null;
      limpiarFormulario();
      cargarClientes(true);
    })
    .catch(err => {
      console.error(err);
      mostrarMensaje("Error al actualizar cliente ❌", "red");
    });
}

function cargarClientes(forzar = false) {
  const lista = document.getElementById("listaClientes");
  if (!lista) return;

  const token = localStorage.getItem("token");
  if (!token) {
    lista.innerHTML = "<li>Debes iniciar sesión primero</li>";
    return;
  }

  // ✅ 🔥 CACHE: si ya hay datos y no estoy forzando, reutilizo
  if (!forzar && clientesCache.length > 0) {
    renderClientes(clientesCache);
    return;
  }

  fetch(`${API_URL}/api/clientes`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    })
    .then(clientes => {
      clientesCache = clientes; // ✅ guardar en cache
      precargarEstadoClientes(clientes); // ✅ NUEVO
      renderClientes(clientes);
    })
    .catch(err => {
      console.error("Error cargando clientes:", err);
      lista.innerHTML = "<li>Error al cargar clientes</li>";
    });
}

function renderClientes(clientes) {
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = "";

  cargarListaNombresPrestamo();

  if (!Array.isArray(clientes) || clientes.length === 0) {
    lista.innerHTML = "<li>No hay clientes registrados</li>";
    return;
  }

  const datosUsuario = obtenerDatosUsuarioDesdeToken();

  clientes.forEach(cliente => {
    const li = document.createElement("li");

    const clienteLink = document.createElement("span");
    clienteLink.className = "link-cliente";
    clienteLink.style.cursor = "pointer";
    clienteLink.textContent = cliente.nombre;

    const cedula = document.createElement("small");
    cedula.textContent = `Cédula: ${cliente.cedula}`;

    const estadoDiv = document.createElement("div");
    estadoDiv.className = "estado-prestamo";
    estadoDiv.id = `prestamo-${cliente.id}`;
    estadoDiv.textContent = "⏳ Cargando estado...";

    li.appendChild(clienteLink);
    li.appendChild(document.createElement("br"));
    li.appendChild(cedula);
    li.appendChild(estadoDiv);

    clienteLink.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      abrirFichaCliente(cliente);
    });

    if (datosUsuario && datosUsuario.rol === "administrador") {
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️ Editar";
      btnEditar.style.marginTop = "6px";
      btnEditar.onclick = () => editarCliente(cliente.id);
      li.appendChild(btnEditar);
    }

    lista.appendChild(li);

    // ✅ ✅ CAMBIO IMPORTANTE (REEMPLAZA EL FETCH)
    verificarPrestamoActivo(cliente.id);
    cargarResumenMoraCliente(cliente.id);

  });
}


function abrirFichaCliente(cliente) {
  // guardar cliente actual
  clienteActual = cliente;

  // mostrar pestaña ficha
  mostrarSeccion("fichaCliente");

  // datos del cliente
  document.getElementById("fichaNombre").textContent = cliente.nombre;
  document.getElementById("fichaCedula").textContent = cliente.cedula;
  document.getElementById("fichaSexo").textContent = cliente.sexo;
  document.getElementById("fichaEstadoCivil").textContent = cliente.estado_civil || "—";
  document.getElementById("fichaTelefono").textContent = cliente.telefono || "—";
  document.getElementById("fichaDepartamento").textContent = cliente.departamento || "—";
  document.getElementById("fichaMunicipio").textContent = cliente.municipio || "—";
  document.getElementById("fichaTrabajo").textContent = cliente.trabajo || "—";
  document.getElementById("fichaBarrio").textContent = cliente.barrio || "—";
  document.getElementById("fichaDireccion").textContent = cliente.direccion || "—";

  // imagen - rutas absolutas para asegurar que se cargan correctamente
  document.getElementById("fotoCliente").src =
    cliente.sexo === "F" ? "/mujer.png" : "/hombre.png";

  // eliminar cliente
  document.getElementById("btnEliminarFicha").onclick = () => {
    eliminarCliente(cliente.id);
    volverAClientes();
  };
  fetch(`${API_URL}/api/prestamos/cliente/${cliente.id}/prestamos-completados`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
})
  .then(res => res.json())
  .then(data => {
    const span = document.getElementById("totalPagado");
    if (span) {
      span.textContent = data.prestamos_completados;
    }
  });

  // comentarios
  document.getElementById("btnGuardarComentario").onclick = () => {
    guardarComentario(cliente.id);
  };
  cargarComentarios(cliente.id);
  document.getElementById("btnCrearRecordatorio").onclick = () =>
  crearRecordatorio(cliente.id);

  cargarRecordatoriosCliente(cliente.id);

  // ✅✅✅ ESTO ERA LO QUE FALTABA ✅✅✅
  cargarPrestamosCliente(cliente.id);
}

function eliminarCliente(clienteId) {
  const confirmar = confirm(
    "¿Estás seguro de eliminar este cliente?\n\nEsto eliminará también sus préstamos, cuotas y comentarios."
  );
  if (!confirmar) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("No autorizado");
    return;
  }

  fetch(`${API_URL}/api/clientes/${clienteId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Error eliminando cliente");
      return res.json();
    })
    .then(data => {
      alert(data.mensaje || "Cliente eliminado correctamente ✅");

      // ✅ FORZAR RECARGA (USANDO CACHE CORRECTAMENTE)
      cargarClientes(true);
    })
    .catch(err => {
      console.error("Error al eliminar cliente:", err);
      alert("Error al eliminar el cliente ❌");
    });
}

function cargarClientesFrecuentes() {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${API_URL}/api/clientes/frecuentes`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    })
    .then(data => {
      const cont = document.getElementById("listaFrecuentes");
      cont.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        cont.innerHTML = "<p>No hay clientes frecuentes aún.</p>";
        return;
      }

      data.forEach(c => {
        const p = document.createElement("p");
        p.appendChild(document.createTextNode("⭐ "));

        const strong = document.createElement("strong");
        strong.textContent = c.nombre;
        p.appendChild(strong);

        p.appendChild(document.createElement("br"));
        p.appendChild(document.createTextNode(`Préstamos completados: ${c.prestamos_completados}`));

        cont.appendChild(p);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("listaFrecuentes").innerHTML =
        "<p>Error al cargar clientes frecuentes.</p>";
    });
}

function guardarComentario(clienteId) {
  const texto = document.getElementById("comentarioTexto").value.trim();
  if (!texto) return alert("Escribe un comentario");

  fetch(`${API_URL}/api/comentarios`, {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({
      cliente_id: clienteId,
      comentario: texto
    })
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("comentarioTexto").value = "";
      cargarComentarios(clienteId);
    });
}

function cargarComentarios(clienteId) {
  const token = localStorage.getItem("token");

  fetch(`${API_URL}/api/comentarios/${clienteId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al cargar comentarios");
      return res.json();
    })
    .then(data => {
      const contenedor = document.getElementById("listaComentarios");
      contenedor.innerHTML = "";

      if (!data.length) {
        contenedor.innerHTML = "<p>No hay comentarios aún.</p>";
        return;
      }

      data.forEach(c => {
        const div = document.createElement("div");
        div.style.marginBottom = "10px";

        const fecha = document.createElement("small");
        fecha.textContent = new Date(c.creado_en).toLocaleString();

        const comentario = document.createElement("p");
        comentario.textContent = c.comentario;

        div.appendChild(fecha);
        div.appendChild(document.createElement("br"));
        div.appendChild(comentario);
        contenedor.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error cargando comentarios:", err);

      const contenedor = document.getElementById("listaComentarios");
      contenedor.innerHTML = "<p>Error al cargar comentarios ❌</p>";
    });
}

