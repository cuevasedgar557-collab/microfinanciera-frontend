function crearRecordatorio(clienteId) {
  const texto = document.getElementById("recordatorioTexto").value.trim();
  const fecha = document.getElementById("recordatorioFecha").value;

  if (!texto || !fecha) {
    mostrarToast("Completa el texto y la fecha del recordatorio", "warning");
    return;
  }

  fetch(`${API_URL}/api/recordatorios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({
      cliente_id: clienteId,
      texto,
      fecha_recordatorio: fecha
    })
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("recordatorioTexto").value = "";
      document.getElementById("recordatorioFecha").value = "";
      cargarRecordatoriosCliente(clienteId);
    })
    .catch(err => console.error(err));
}
function cargarRecordatoriosCliente(clienteId) {
  fetch(`${API_URL}/api/recordatorios/cliente/${clienteId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(recordatorios => {
      const pendientes = document.getElementById("listaRecordatoriosPendientes");
      const hechos = document.getElementById("listaRecordatoriosHechos");

      pendientes.innerHTML = "";
      hechos.innerHTML = "";

      recordatorios.forEach(r => {
        const row = document.createElement("div");
        row.style.marginBottom = "8px";

        const fecha = document.createElement("div");
        fecha.textContent = `📅 ${r.fecha_recordatorio}`;
        row.appendChild(fecha);

        const texto = document.createElement("div");
        texto.textContent = r.texto;
        row.appendChild(texto);

        if (r.estado === "pendiente") {
          const button = document.createElement("button");
          button.textContent = "Marcar como hecho ✔";
          button.onclick = () => marcarRecordatorioHecho(r.id, clienteId);
          row.appendChild(button);
          pendientes.appendChild(row);
        } else {
          row.style.color = "gray";
          const dias = document.createElement("div");
          dias.textContent = `⏳ Se eliminará en ${r.dias_restantes} días`;
          row.appendChild(dias);
          hechos.appendChild(row);
        }
      });
    })
    .catch(err => console.error(err));
}
function marcarRecordatorioHecho(recordatorioId, clienteId) {
  fetch(`${API_URL}/api/recordatorios/${recordatorioId}/hecho`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(() => {
      cargarRecordatoriosCliente(clienteId);
    })
    .catch(err => console.error(err));
}
function marcarRecordatorioDesdeDia(id) {
  fetch(`${API_URL}/api/recordatorios/${id}/hecho`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(() => cargarRecordatoriosDelDia())
    .catch(err => console.error(err));
}

function cargarRecordatorios(tipo) {
  let url = "";

  if (tipo === "hoy") {
    url = `${API_URL}/api/recordatorios/hoy`;
  } else if (tipo === "todos") {
    url = `${API_URL}/api/recordatorios/todos`;
  } else if (tipo === "vencidos") {
    url = `${API_URL}/api/recordatorios/vencidos`;
  }

  fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => renderRecordatoriosCentral(data))
    .catch(err => {
      console.error("Error cargando recordatorios:", err);
    });
}
function renderRecordatoriosCentral(data) {
  const cont = document.getElementById("listaRecordatorios");
  if (!cont) return;

  cont.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    cont.innerHTML = "<p>No hay recordatorios.</p>";
    return;
  }

  data.forEach(r => {
    const card = document.createElement("div");
    card.className = "card";

    const strong = document.createElement("strong");
    strong.textContent = r.cliente;
    card.appendChild(strong);
    card.appendChild(document.createElement("br"));

    const texto = document.createElement("div");
    texto.textContent = r.texto;
    card.appendChild(texto);
    card.appendChild(document.createElement("br"));
    card.appendChild(document.createElement("br"));

    const fechaProgramado = document.createElement("small");
    fechaProgramado.textContent = `📅 Programado: ${formatearSoloFecha(r.fecha_recordatorio)}`;
    card.appendChild(fechaProgramado);
    card.appendChild(document.createElement("br"));

    const fechaCreado = document.createElement("small");
    fechaCreado.textContent = `🕒 Creado: ${formatearFechaHora(r.fecha_creado)}`;
    card.appendChild(fechaCreado);

    if (r.estado === "hecho" && r.dias_restantes !== null) {
      card.appendChild(document.createElement("br"));
      const infoExtra = document.createElement("small");
      infoExtra.textContent = `⏳ Se elimina en ${r.dias_restantes} días`;
      card.appendChild(infoExtra);
    }

    card.appendChild(document.createElement("br"));
    card.appendChild(document.createElement("br"));

    if (r.estado === "pendiente") {
      const button = document.createElement("button");
      button.textContent = "✓ Marcar como hecho";
      button.onclick = () => marcarRecordatorioDesdeCentral(r.id);
      card.appendChild(button);
    }

    cont.appendChild(card);
  });
}
function marcarRecordatorioDesdeCentral(id) {
  fetch(`${API_URL}/api/recordatorios/${id}/hecho`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(() => cargarRecordatorios("hoy"))
    .catch(err => console.error("Error marcando como hecho:", err));
}
