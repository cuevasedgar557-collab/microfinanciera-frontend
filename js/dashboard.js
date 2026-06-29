function cargarCobrosHoy() {
  const cont = document.getElementById("cobrosHoy");

  fetch(`${API_URL}/api/cuotas/cobros-hoy`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log(data); // Agrega esta línea para ver los datos que la API devuelve
      cont.innerHTML = "";

      if (!data.length) {
        cont.innerHTML = "<p>✅ No hay cobros hoy</p>";
        return;
      }

      data.forEach(cliente => {
        const div = document.createElement("div");
        div.textContent = cliente.nombre;
        div.style.padding = "8px";
        div.style.borderBottom = "1px solid #ccc";
        div.style.cursor = "pointer";

        div.onclick = () => {
          // ✅ escribir nombre en buscador
          const input = document.getElementById("buscarClienteCuotas");
          input.value = cliente.nombre;

          // ✅ cambiar a sección cuotas
          mostrarSeccion("cuotas");

          // ✅ disparar búsqueda automática
          setTimeout(() => {
            input.dispatchEvent(new Event("input"));
          }, 200);
        };

        cont.appendChild(div);
      });

    })
    .catch(err => {
      console.error("Error cargando cobros:", err.message);
      cont.innerHTML = "<p>❌ Error cargando cobros</p>";
    });
}


//cargar meta de hoy

function getColorForIndex(index) {
  const palette = [
    "#4caf50",
    "#2196f3",
    "#ff9800",
    "#9c27b0",
    "#f44336",
    "#3f51b5",
    "#00bcd4",
    "#8bc34a",
    "#ff5722",
    "#607d8b"
  ];
  return palette[index % palette.length];
}

function esAdministrador() {
  const token = localStorage.getItem("token");
  if (!token) return false;
  const payload = JSON.parse(atob(token.split(".")[1]));
  return String(payload.rol).toLowerCase() === "administrador";
}

function ocultarBloquesTrabajador() {
  if (esAdministrador()) return;

  const pagosCard = document.querySelector("#pagosHoy")?.closest(".card");
  const metasCard = document.querySelector("#metasAnteriores")?.closest(".card");

  if (pagosCard) pagosCard.style.display = "none";
  if (metasCard) metasCard.style.display = "none";
}

function drawSemicircleMetaChart(canvasId, payments, cobrado, meta) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height * 0.95;
  const radius = Math.min(width / 2 - 12, height - 24);
  const lineWidth = Math.max(16, radius * 0.22);

  // Fondo del semicírculo
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineCap = "round";
  ctx.stroke();

  if (!meta || meta <= 0 || cobrado <= 0) {
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#222";
    ctx.textAlign = "center";
    ctx.fillText("0%", centerX, centerY - radius * 0.2);
    return;
  }

  let startAngle = Math.PI;
  const totalAngle = Math.PI * Math.min(cobrado / meta, 1);
  const pagos = Array.isArray(payments) ? payments : [];

  if (pagos.length) {
    pagos.forEach((item, idx) => {
      const segment = Math.min(item.totalPagadoHoy / meta, 1);
      if (segment <= 0) return;

      const endAngle = startAngle + Math.PI * segment;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
      ctx.strokeStyle = getColorForIndex(idx);
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "butt";
      ctx.stroke();
      startAngle = endAngle;
    });
  } else {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + totalAngle, false);
    ctx.strokeStyle = "#4caf50";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  const porcentaje = Math.round((cobrado / meta) * 100);
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "#222";
  ctx.textAlign = "center";
  ctx.fillText(`${porcentaje}%`, centerX, centerY - radius * 0.2);
}

function cargarMetaHoy() {
  const cont = document.getElementById("metaTexto");
  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const rol = payload.rol;
  const esAdmin = String(rol).toLowerCase() === "administrador";

  Promise.all([
    fetch(`${API_URL}/api/cuotas/meta-hoy`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()),
    fetch(`${API_URL}/api/cuotas/pagos-hoy`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
  ])
    .then(([metaData, pagosData]) => {
      const total = Number(metaData.totalHoy || 0);
      const cobrado = Number(metaData.cobradoHoy || 0);
      const porcentaje = total > 0 ? Math.round((cobrado / total) * 100) : 0;
      const tipoMeta = esAdmin ? "Meta global" : "Mi meta";
      const pagos = Array.isArray(pagosData) ? pagosData : [];

      drawSemicircleMetaChart("graficoMeta", pagos, cobrado, total);

      const restante = Math.max(0, total - cobrado);
      const statusTexto = total > 0 && cobrado < total
        ? `Faltan C$${restante.toFixed(2)} para completar la meta.`
        : total > 0
          ? "Meta completada 🎉"
          : "No hay meta definida para hoy.";

      cont.innerHTML = "";

      const tituloMeta = document.createElement("p");
      const strongTipoMeta = document.createElement("strong");
      strongTipoMeta.textContent = `${tipoMeta}:`;
      tituloMeta.appendChild(strongTipoMeta);
      cont.appendChild(tituloMeta);

      const metaLine = document.createElement("p");
      const metaStrong = document.createElement("strong");
      metaStrong.textContent = "Meta:";
      metaLine.appendChild(metaStrong);
      metaLine.appendChild(document.createTextNode(` C$${total.toFixed(2)}`));
      cont.appendChild(metaLine);

      const cobradoLine = document.createElement("p");
      const cobradoStrong = document.createElement("strong");
      cobradoStrong.textContent = "Cobrado:";
      cobradoLine.appendChild(cobradoStrong);
      cobradoLine.appendChild(document.createTextNode(` C$${cobrado.toFixed(2)}`));
      cont.appendChild(cobradoLine);

      const porcentajeLine = document.createElement("p");
      porcentajeLine.style.marginTop = "8px";
      porcentajeLine.textContent = `${porcentaje}% completado`;
      cont.appendChild(porcentajeLine);

      const statusLine = document.createElement("p");
      statusLine.style.marginTop = "6px";
      statusLine.style.color = restante > 0 ? "#d32f2f" : "#388e3c";
      statusLine.style.fontWeight = "600";
      statusLine.textContent = statusTexto;
      cont.appendChild(statusLine);

      if (pagos.length) {
        const legend = document.createElement("div");
        legend.style.display = "grid";
        legend.style.gridTemplateColumns = "1fr 1fr";
        legend.style.gap = "6px";
        legend.style.marginTop = "10px";

        pagos.forEach((item, idx) => {
          const color = getColorForIndex(idx);
          const label = document.createElement("div");
          const marker = document.createElement("span");
          marker.style.display = "inline-block";
          marker.style.width = "12px";
          marker.style.height = "12px";
          marker.style.background = color;
          marker.style.marginRight = "8px";
          marker.style.verticalAlign = "middle";
          marker.style.borderRadius = "3px";

          const strong = document.createElement("strong");
          strong.textContent = item.usuario;

          label.appendChild(marker);
          label.appendChild(strong);
          label.appendChild(document.createTextNode(` C$${Number(item.totalPagadoHoy).toFixed(2)}`));
          legend.appendChild(label);
        });

        cont.appendChild(legend);
      }
    })
    .catch(err => {
      console.error(err);
      drawSemicircleMetaChart("graficoMeta", [], 0, 0);
      cont.innerHTML = "<p>Error cargando meta</p>";
    });
}
function cargarRecordatoriosHoy() {
  const cont = document.getElementById("recordatoriosHoy");

  fetch(`${API_URL}/api/recordatorios/hoy`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => {

      cont.innerHTML = "";

      if (!data.length) {
        cont.innerHTML = "<p>✅ Sin recordatorios</p>";
        return;
      }

      data.forEach(r => {
        const div = document.createElement("div");
        div.style.padding = "8px";
        div.style.borderBottom = "1px solid #ccc";

        const icon = document.createTextNode("• ");
        const strong = document.createElement("strong");
        strong.textContent = r.nombre || r.cliente || "Sin cliente";

        const small = document.createElement("small");
        small.textContent = r.descripcion || r.texto || "";

        div.appendChild(icon);
        div.appendChild(strong);
        div.appendChild(document.createElement("br"));
        div.appendChild(small);

        cont.appendChild(div);
      });

    })
    .catch(err => {
      console.error(err);
      cont.innerHTML = "<p>Error cargando recordatorios</p>";
    });
}

function cargarPagosHoy() {
  const cont = document.getElementById("pagosHoy");

  fetch(`${API_URL}/api/cuotas/pagos-hoy`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      cont.innerHTML = "";

      if (!data.length) {
        cont.innerHTML = "<p>✅ No hay pagos hoy</p>";
        return;
      }

      data.forEach(item => {
        const div = document.createElement("div");
        div.style.padding = "8px";
        div.style.borderBottom = "1px solid #ccc";

        const strong = document.createElement("strong");
        strong.textContent = item.usuario;

        const detalles = document.createElement("div");
        detalles.textContent = `Pagos: ${item.pagosHoy} · Total: C$${Number(item.totalPagadoHoy).toFixed(2)}`;

        div.appendChild(strong);
        div.appendChild(document.createElement("br"));
        div.appendChild(detalles);
        cont.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error cargando pagos hoy:", err.message);
      cont.innerHTML = "<p>❌ Error cargando pagos</p>";
    });
}

function cargarMetasAnteriores() {
  const cont = document.getElementById("metasAnteriores");

  fetch(`${API_URL}/api/cuotas/metas-anteriores`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      cont.innerHTML = "";

      if (!data.length) {
        cont.innerHTML = "<p>✅ No hay metas anteriores</p>";
        return;
      }

      const lista = document.createElement("div");
      lista.style.display = "grid";
      lista.style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
      lista.style.gap = "8px";
      lista.style.fontSize = "0.95rem";

      const header = document.createElement("div");
      header.innerHTML = "<strong>Fecha</strong>";
      const headerMeta = document.createElement("div");
      headerMeta.innerHTML = "<strong>Meta</strong>";
      const headerCobrado = document.createElement("div");
      headerCobrado.innerHTML = "<strong>Cobrado</strong>";
      const headerPorcentaje = document.createElement("div");
      headerPorcentaje.innerHTML = "<strong>%</strong>";

      lista.appendChild(header);
      lista.appendChild(headerMeta);
      lista.appendChild(headerCobrado);
      lista.appendChild(headerPorcentaje);

      data.forEach(item => {
        const porcentaje = item.meta > 0
          ? Math.round((item.cobrado / item.meta) * 100)
          : 0;

        const rowFecha = document.createElement("div");
        rowFecha.textContent = item.fecha;
        const rowMeta = document.createElement("div");
        rowMeta.textContent = `C$${Number(item.meta).toFixed(2)}`;
        const rowCobrado = document.createElement("div");
        rowCobrado.textContent = `C$${Number(item.cobrado).toFixed(2)}`;
        const rowPorcentaje = document.createElement("div");
        rowPorcentaje.textContent = `${porcentaje}%`;

        lista.appendChild(rowFecha);
        lista.appendChild(rowMeta);
        lista.appendChild(rowCobrado);
        lista.appendChild(rowPorcentaje);
      });

      cont.appendChild(lista);
    })
    .catch(err => {
      console.error("Error cargando metas anteriores:", err.message);
      cont.innerHTML = "<p>❌ Error cargando metas anteriores</p>";
    });
}
function cargarClientesDashboard() {
  fetch(`${API_URL}/api/clientes/dashboard`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then(res => res.json())
    .then(data => {

      const activos = document.getElementById("clientesActivos");
      const sinPrestamo = document.getElementById("clientesSinPrestamo");

      activos.innerHTML = "";
      sinPrestamo.innerHTML = "";

      data.forEach(c => {

        const div = document.createElement("div");

        // ✅ estilo base
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        div.style.padding = "8px";
        div.style.borderBottom = "1px solid #ddd";

        const nombre = document.createElement("span");
        nombre.textContent = c.nombre;

        // ✅ CON PRÉSTAMO
        if (c.prestamo_id) {

          nombre.style.color = "green";
          nombre.style.fontWeight = "bold";

          div.appendChild(nombre);
          activos.appendChild(div);

        } else {

          // ✅ SIN PRÉSTAMO
          nombre.style.color = "#444";

          const btn = document.createElement("button");
          btn.textContent = "Asignar";

          btn.style.background = "#007bff";
          btn.style.color = "#fff";
          btn.style.border = "none";
          btn.style.padding = "5px 10px";
          btn.style.borderRadius = "5px";
          btn.style.cursor = "pointer";

          btn.onclick = () => {
            mostrarSeccion("prestamos");

            const input = document.getElementById("nombrePrestamo");
            input.value = c.nombre;
          };

          div.appendChild(nombre);
          div.appendChild(btn);

          sinPrestamo.appendChild(div);
        }

      });

    })
    .catch(err => console.error(err));
}


document.addEventListener("DOMContentLoaded", () => {
  cargarCobrosHoy();
  cargarMetaHoy();
  cargarRecordatoriosHoy();
  cargarClientesDashboard();

  if (esAdministrador()) {
    cargarPagosHoy();
    cargarMetasAnteriores();
  }

  ocultarBloquesTrabajador();
});


