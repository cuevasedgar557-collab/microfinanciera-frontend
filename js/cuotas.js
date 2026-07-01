const EMPRESA = "MICROFINANCIERA"; // 🔁 luego lo cambias

function obtenerUsuarioDesdeToken() {
  const token = localStorage.getItem("token");
  if (!token) return { nombre: "Usuario" };

  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload;
}

const usuarioActual = obtenerUsuarioDesdeToken();

function cargarCalendarioCuotas(prestamoId) {
  fetch(`${API_URL}/api/cuotas/prestamo/${prestamoId}?t=${Date.now()}`, {
    cache: "no-store"
  })
    .then(res => res.json())
    .then(cuotas => {
      const cont = document.getElementById("calendarioCuotas");
      cont.innerHTML = "";

      if (!Array.isArray(cuotas) || cuotas.length === 0) {
        cont.innerHTML = "<p>No hay préstamo activo.</p>";
        prestamoActivoId = null;
        return;
      }

      const hayPendientes = cuotas.some(
        c => String(c.estado).toLowerCase() === "pendiente"
      );

      if (!hayPendientes) {
        cont.innerHTML = "<p>✅ No hay préstamo activo.</p>";
        prestamoActivoId = null;
        return;
      }

      let totalPrestamo = 0;
      let totalPagado = 0;

      cuotas.forEach(c => {
        totalPrestamo += Number(c.monto);
        totalPagado += Number(c.pagado);
      });

      cuotas.forEach(c => {
        const div = document.createElement("div");
        div.className = "cuota-card";

        const montoBase = Number(c.monto);
        const pagado = Number(c.pagado);
        const saldoActual = Number(c.saldo);
        const moraAplicada = Number(c.mora || 0);
        const totalPagar = Number(c.total_pagar || saldoActual + moraAplicada);

        const titulo = document.createElement("strong");
        titulo.textContent = `Cuota ${c.numero}`;
        div.appendChild(titulo);

        const contenido = document.createElement("div");
        contenido.className = "cuota-contenido";

        contenido.innerHTML = `
          <div class="cuota-info">
            <div>Fecha vencimiento: ${new Date(c.fecha_pago).toLocaleDateString()}</div>
            <div>Monto base: $${montoBase.toFixed(2)}</div>
            <div>Pagado: $${pagado.toFixed(2)}</div>
            <div><strong>Saldo actual:</strong> $${saldoActual.toFixed(2)}</div>
            <div><strong>Total a pagar:</strong> $${totalPagar.toFixed(2)}</div>
          </div>
        `;

        div.appendChild(contenido);

        if (String(c.estado).toLowerCase() === "pendiente") {
          div.classList.add("cuota-pendiente");

          if (c.dias_mora && Number(c.dias_mora) > 0) {
            const moraBox = document.createElement("div");
            moraBox.className = "cuota-mora-box";
            moraBox.innerHTML = `⏱ Días de atraso: ${c.dias_mora}`;
            div.appendChild(moraBox);
          }

          if (moraAplicada > 0) {
            const moraDinero = document.createElement("div");
            moraDinero.className = "cuota-mora-box";
            moraDinero.innerHTML = `⚠ Mora aplicada: $${moraAplicada.toFixed(2)}`;
            div.appendChild(moraDinero);
          }

          const actions = document.createElement("div");
          actions.className = "cuota-actions";

          const btnPagar = document.createElement("button");
          btnPagar.textContent = "Pagar todo";
          btnPagar.onclick = () => pagarCuota(c.id, totalPagar);

          const btnParcial = document.createElement("button");
          btnParcial.textContent = "Ingresar pago";
          btnParcial.onclick = () => ingresarPagoCuota(c.id, totalPagar);

          actions.appendChild(btnPagar);
          actions.appendChild(btnParcial);
          div.appendChild(actions);

        } else {
          div.classList.add("cuota-pagada");

          const pagadaLabel = document.createElement("strong");
          pagadaLabel.textContent = "Pagada ✅";
          div.appendChild(pagadaLabel);

          const actions = document.createElement("div");
          actions.className = "cuota-actions";

          const btnWhatsapp = document.createElement("button");
          btnWhatsapp.textContent = "📲 Enviar recibo";
          btnWhatsapp.onclick = () => {
            enviarWhatsAppRecibo(c, totalPrestamo, totalPagado);
          };

          actions.appendChild(btnWhatsapp);
          div.appendChild(actions);
        }

        cont.appendChild(div);
      });
    })
    .catch(err => {
      console.error("❌ Error cargando cuotas:", err);
      document.getElementById("calendarioCuotas").innerHTML =
        "<p>Error al cargar cuotas.</p>";
    });
}
function ingresarPagoCuota(cuotaId, saldoActual) {
  const monto = prompt(
    `Ingrese el monto a abonar (Saldo actual: $${saldoActual})`
  );

  if (!monto) return;

  const montoNum = parseFloat(monto);

  if (isNaN(montoNum) || montoNum <= 0) {
    alert("Monto inválido");
    return;
  }

  if (montoNum > saldoActual) {
    alert("El monto no puede ser mayor al saldo pendiente");
    return;
  }

  fetch(`${API_URL}/api/cuotas/${cuotaId}/pago`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ monto: montoNum })
  })
    .then(res => res.json())
    .then(() => {
      alert("Pago registrado ✅");
      cargarCalendarioCuotas(prestamoActivoId);
    })
    .catch(err => {
      console.error(err);
      alert("Error registrando el pago");
    });
}
function pagarCuota(cuotaId, montoPendiente) {
  console.log("👉 Pagando cuota completa:", cuotaId, "Monto:", montoPendiente);

  fetch(`${API_URL}/api/cuotas/${cuotaId}/pago`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({
      monto: montoPendiente
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Error registrando el pago");
      return res.json();
    })
    .then(() => {
      // 🔄 Recargar calendario de cuotas
      cargarCalendarioCuotas(prestamoActivoId);

      // 🔄 Actualizar total pagado del cliente
      if (clienteActual) {
        actualizarTotalPagado(clienteActual.id);
      }
    })
    .catch(err => {
      console.error("❌ Error al pagar cuota:", err);
      alert("Error al registrar el pago");
    });
}
//recido de cuota

function enviarWhatsAppRecibo(cuota, totalPrestamo, totalPagado) {
  if (!clienteActual) return;

  const nombreCliente = clienteActual.nombre;
  const telefono = clienteActual.telefono;

  if (!telefono) {
    alert("El cliente no tiene número de teléfono");
    return;
  }

  // ✅ limpiar número (solo números)
  const numero = telefono.replace(/\D/g, "");

  const fecha = new Date().toLocaleDateString();

  // ✅ nombre usuario seguro
  const nombreUsuario =
    localStorage.getItem("usuario_nombre") ||
    usuarioActual.usuario ||
    "Administrador";

  // ✅ CÁLCULOS CORRECTOS (DE TODO EL PRÉSTAMO)
  const saldoAnterior = totalPrestamo - (totalPagado - cuota.pagado);
  const saldoActual = totalPrestamo - totalPagado;

  // ✅ total de cuotas
  const totalCuotas = Math.round(totalPrestamo / Number(cuota.monto));
  const pendientes = totalCuotas - cuota.numero;

  // ✅ número de recibo
  const recibo = `A${cuota.numero.toString().padStart(3, "0")}`;

  // ✅ MENSAJE PROFESIONAL
  const mensaje =
`📄 *ACTÍVATE*

${nombreCliente}

Cuota pactada C$${Number(cuota.monto).toFixed(2)}
Cant. cuota ${cuota.numero}
Pendiente ${pendientes}

Fecha: ${fecha}
Recibo: ${recibo}

Saldo anterior C$${saldoAnterior.toFixed(2)}
Abono total    C$${Number(cuota.pagado).toFixed(2)}
Saldo actual   C$${saldoActual.toFixed(2)}

Ejecutivo: ${nombreUsuario}`;

  // ✅ URL CORRECTA (SIN &amp;)
  const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;

  // ✅ abrir WhatsApp
  window.location.assign(url);
}



document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("buscarClienteCuotas");
  const calendario = document.getElementById("calendarioCuotas");

  if (!input || !calendario) return;

  input.addEventListener("input", function () {
    const nombre = input.value.trim().toLowerCase();

    // ✅ Si no hay texto → limpiar
    if (nombre === "") {
      calendario.innerHTML = "";
      prestamoActivoId = null;
      return;
    }

    // ✅ Buscar cliente en cache
    const cliente = clientesCache.find(c =>
      c.nombre.toLowerCase().includes(nombre)
    );

    if (!cliente) {
      calendario.innerHTML = "<p>Cliente no encontrado.</p>";
      prestamoActivoId = null;
      return;
    }

    clienteActual = cliente;

    // ✅ TOKEN OBLIGATORIO
    const token = localStorage.getItem("token");
    if (!token) {
      calendario.innerHTML = "<p>No autorizado.</p>";
      prestamoActivoId = null;
      return;
    }

    // ✅ Buscar préstamo activo (CON TOKEN)
    fetch(`${API_URL}/api/prestamos/cliente/${cliente.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
      })
      .then(prestamos => {
        if (!Array.isArray(prestamos)) {
          calendario.innerHTML = "<p>Error al cargar el préstamo.</p>";
          prestamoActivoId = null;
          return;
        }

        const activo = prestamos.find(p => p.estado === "activo");

        if (!activo) {
          calendario.innerHTML =
            "<p>Este cliente no tiene préstamo activo.</p>";
          prestamoActivoId = null;
          return;
        }

        prestamoActivoId = activo.id;
        cargarCalendarioCuotas(activo.id);
      })
      .catch(err => {
        console.error(err);
        calendario.innerHTML =
          "<p>Error al cargar el préstamo.</p>";
        prestamoActivoId = null;
      });
  });
});
