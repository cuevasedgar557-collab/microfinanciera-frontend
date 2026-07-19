function asignarPrestamo() {

  const token = localStorage.getItem("token");
  if (!token) {
    mostrarToast("No has iniciado sesión", "error");
    return;
  }

  // ✅ Validar cliente
  if (!clientePrestamoId) {
    mostrarToast("Selecciona un cliente válido de la lista", "warning");
    return;
  }

  const monto = parseFloat(document.getElementById("monto").value);
  const interes = parseFloat(document.getElementById("interes").value);
  const plazo = parseInt(document.getElementById("plazo").value, 10);
  const tipoCuota = document.getElementById("tipoCuota").value;
  const tipoRespaldo = document.getElementById("tipoRespaldo").value;

  // ✅ Validaciones básicas
  if (
    isNaN(monto) || monto <= 0 ||
    isNaN(interes) || interes < 0 ||
    isNaN(plazo) || plazo <= 0
  ) {
    mostrarToast("Completa todos los campos correctamente", "error");
    return;
  }

  let dataExtra = {};

  // ✅ Validar tipo respaldo
  if (!tipoRespaldo) {
    mostrarToast("Selecciona tipo de respaldo", "warning");
    return;
  }

  // ✅ FIADOR
  if (tipoRespaldo === "fiador") {

    dataExtra.fiador = {
      nombre: document.getElementById("fiadorNombre").value,
      cedula: document.getElementById("fiadorCedula").value,
      telefono: document.getElementById("fiadorTelefono").value,
      direccion: document.getElementById("fiadorDireccion").value,
      sexo: document.getElementById("fiadorSexo").value,
      estado_civil: document.getElementById("fiadorEstadoCivil").value,
      parentesco: document.getElementById("fiadorParentesco").value
    };

    if (!dataExtra.fiador.nombre || !dataExtra.fiador.cedula) {
      mostrarToast("Completa los datos del fiador", "error");
      return;
    }
  }

  // ✅ GARANTÍA
  if (tipoRespaldo === "garantia") {
    dataExtra.garantia = document.getElementById("garantiaTexto").value;

    if (!dataExtra.garantia) {
      mostrarToast("Escribe la garantía", "error");
      return;
    }
  }

  // ✅ ENVÍO
  fetch(`${API_URL}/api/prestamos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      cliente_id: clientePrestamoId,
      monto,
      interes,
      plazo,
      tipo_cuota: tipoCuota,
      tipo_respaldo: tipoRespaldo,
      ...dataExtra
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al crear préstamo");
      return res.json();
    })
    .then(() => {
      mostrarToast("✅ Préstamo asignado correctamente", "success");

      // ✅ Limpiar campos principales
      document.getElementById("nombrePrestamo").value = "";
      document.getElementById("monto").value = "";
      document.getElementById("interes").value = "";
      document.getElementById("plazo").value = "";
      document.getElementById("tipoCuota").value = "mensual";

      // ✅ Limpiar FIADOR
      document.getElementById("fiadorNombre").value = "";
      document.getElementById("fiadorCedula").value = "";
      document.getElementById("fiadorTelefono").value = "";
      document.getElementById("fiadorDireccion").value = "";
      document.getElementById("fiadorSexo").value = "";
      document.getElementById("fiadorEstadoCivil").value = "";
      document.getElementById("fiadorParentesco").value = "";

      // ✅ Limpiar GARANTÍA
      document.getElementById("garantiaTexto").value = "";

      // ✅ Reset tipo respaldo (esto oculta formularios automáticamente)
      document.getElementById("tipoRespaldo").value = "";
      document.getElementById("tipoRespaldo").dispatchEvent(new Event("change"));

      // ✅ Reset ID cliente
      clientePrestamoId = null;

      // ✅ UX PRO
      document.getElementById("nombrePrestamo").focus();

      // ✅ Recargar clientes
      cargarClientes();
    })
    .catch(err => {
      console.error(err);
      mostrarToast("Error al asignar préstamo", "error");
    });
}

function agregarPrestamoExistente() {
  const token = localStorage.getItem("token");
  if (!token) {
    mostrarToast("No has iniciado sesión", "error");
    return;
  }

  if (!clientePrestamoExistenteId) {
    mostrarToast("Selecciona un cliente válido de la lista", "warning");
    return;
  }

  const monto = parseFloat(document.getElementById("montoExistente").value);
  const interes = parseFloat(document.getElementById("interesExistente").value);
  const plazo = parseInt(document.getElementById("plazoExistente").value, 10);
  const tipoCuota = document.getElementById("tipoCuotaExistente").value;
  const fechaInicio = document.getElementById("fechaInicioExistente").value;
  const cuotasPagadas = parseInt(document.getElementById("cuotasPagadasExistente").value, 10);
  const tipoRespaldo = document.getElementById("tipoRespaldoExistente").value;

  if (
    isNaN(monto) || monto <= 0 ||
    isNaN(interes) || interes < 0 ||
    isNaN(plazo) || plazo <= 0 ||
    !fechaInicio
  ) {
    mostrarToast("Completa todos los campos correctamente", "error");
    return;
  }

  let dataExtra = {};

  if (!tipoRespaldo) {
    mostrarToast("Selecciona tipo de respaldo", "warning");
    return;
  }

  if (tipoRespaldo === "fiador") {
    dataExtra.fiador = {
      nombre: document.getElementById("fiadorNombreExistente").value,
      cedula: document.getElementById("fiadorCedulaExistente").value,
      telefono: document.getElementById("fiadorTelefonoExistente").value,
      direccion: document.getElementById("fiadorDireccionExistente").value,
      sexo: document.getElementById("fiadorSexoExistente").value,
      estado_civil: document.getElementById("fiadorEstadoCivilExistente").value,
      parentesco: document.getElementById("fiadorParentescoExistente").value
    };

    if (!dataExtra.fiador.nombre || !dataExtra.fiador.cedula) {
      mostrarToast("Completa los datos del fiador", "error");
      return;
    }
  }

  if (tipoRespaldo === "garantia") {
    dataExtra.garantia = document.getElementById("garantiaTextoExistente").value;

    if (!dataExtra.garantia) {
      mostrarToast("Escribe la garantía", "error");
      return;
    }
  }

  fetch(`${API_URL}/api/prestamos/existente`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      cliente_id: clientePrestamoExistenteId,
      monto,
      interes,
      plazo,
      tipo_cuota: tipoCuota,
      tipo_respaldo: tipoRespaldo,
      fecha_inicio: fechaInicio,
      cuotas_pagadas: isNaN(cuotasPagadas) ? 0 : cuotasPagadas,
      ...dataExtra
    })
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al agregar préstamo existente");
      return res.json();
    })
    .then(() => {
      mostrarToast("✅ Préstamo existente agregado correctamente", "success");

      document.getElementById("nombrePrestamoExistente").value = "";
      document.getElementById("montoExistente").value = "";
      document.getElementById("interesExistente").value = "";
      document.getElementById("plazoExistente").value = "";
      document.getElementById("fechaInicioExistente").value = "";
      document.getElementById("tipoCuotaExistente").value = "mensual";
      document.getElementById("cuotasPagadasExistente").value = "";
      document.getElementById("tipoRespaldoExistente").value = "";
      document.getElementById("tipoRespaldoExistente").dispatchEvent(new Event("change"));
      clientePrestamoExistenteId = null;
      cargarClientes();
    })
    .catch(err => {
      console.error(err);
      mostrarToast("Error al agregar préstamo existente", "error");
    });
}


function cargarPrestamosCliente(clienteId) {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${API_URL}/api/prestamos/cliente/${clienteId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    })
    .then(prestamos => {
      const cont = document.getElementById("prestamosCliente");
      const calendario = document.getElementById("calendarioCuotas");

      cont.innerHTML = "";
      calendario.innerHTML = "";

      if (!Array.isArray(prestamos) || prestamos.length === 0) {
        cont.innerHTML = "<p>✅ No hay préstamos.</p>";
        return;
      }

      // ✅ TOMAR SOLO PRÉSTAMOS ACTIVOS
      const activos = prestamos.filter(p => p.estado === "activo");

      if (activos.length === 0) {
        cont.innerHTML = "<p>✅ No hay préstamo activo.</p>";
        return;
      }

      // ✅ TOMAR EL MÁS RECIENTE (ID MÁS ALTO)
      const activo = activos.sort((a, b) => b.id - a.id)[0];

      const card = document.createElement("div");
      card.className = "card";

      const estadoLabel = document.createElement("strong");
      estadoLabel.textContent = "Estado:";
      card.appendChild(estadoLabel);
      card.appendChild(document.createTextNode(" Activo"));
      card.appendChild(document.createElement("br"));

      const montoLabel = document.createElement("strong");
      montoLabel.textContent = "Monto:";
      card.appendChild(montoLabel);
      card.appendChild(document.createTextNode(` $${Number(activo.monto).toFixed(2)}`));
      card.appendChild(document.createElement("br"));

      const totalLabel = document.createElement("strong");
      totalLabel.textContent = "Total:";
      card.appendChild(totalLabel);
      card.appendChild(document.createTextNode(` $${Number(activo.total).toFixed(2)}`));
      card.appendChild(document.createElement("br"));

      const plazoLabel = document.createElement("strong");
      plazoLabel.textContent = "Plazo:";
      card.appendChild(plazoLabel);
      card.appendChild(document.createTextNode(` ${activo.plazo} (${activo.tipo_cuota})`));
      card.appendChild(document.createElement("br"));

      const inicioLabel = document.createElement("strong");
      inicioLabel.textContent = "Inicio:";
      card.appendChild(inicioLabel);
      card.appendChild(document.createTextNode(` ${new Date(activo.fecha_inicio).toLocaleDateString()}`));

      

      if (activo.tipo_respaldo === "fiador") {
        const respaldo = document.createElement("div");
        respaldo.style.marginTop = "12px";
        respaldo.style.padding = "10px";
        respaldo.style.background = "#f8f9fa";
        respaldo.style.borderLeft = "4px solid #0d6efd";
        respaldo.style.borderRadius = "8px";

        const title = document.createElement("strong");
        title.style.color = "#0d6efd";
        title.textContent = "🔐 Respaldo";
        respaldo.appendChild(title);
        respaldo.appendChild(document.createElement("br"));
        respaldo.appendChild(document.createElement("br"));

        const nombre = document.createElement("div");
        nombre.textContent = `👤 Nombre: ${activo.fiador_nombre || "—"}`;
        respaldo.appendChild(nombre);

        const telefono = document.createElement("div");
        telefono.textContent = `📞 Tel: ${activo.fiador_telefono || "—"}`;
        respaldo.appendChild(telefono);

        const parentesco = document.createElement("div");
        parentesco.textContent = `🤝 Parentesco: ${activo.parentesco || "—"}`;
        respaldo.appendChild(parentesco);

        card.appendChild(respaldo);
      }

      if (activo.tipo_respaldo === "garantia") {
        const respaldo = document.createElement("div");
        respaldo.style.marginTop = "12px";
        respaldo.style.padding = "10px";
        respaldo.style.background = "#f8f9fa";
        respaldo.style.borderLeft = "4px solid #198754";
        respaldo.style.borderRadius = "8px";

        const title = document.createElement("strong");
        title.style.color = "#198754";
        title.textContent = "🔐 Garantía";
        respaldo.appendChild(title);
        respaldo.appendChild(document.createElement("br"));
        respaldo.appendChild(document.createElement("br"));

        const descripcion = document.createElement("div");
        descripcion.textContent = `📝 Descripción: ${activo.garantia || "—"}`;
        respaldo.appendChild(descripcion);

        card.appendChild(respaldo);
      }

      cont.appendChild(card);

      prestamoActivoId = activo.id;
      cargarCalendarioCuotas(activo.id);
    })
    .catch(err => {
      console.error("Error cargando préstamos:", err);
      document.getElementById("prestamosCliente").innerHTML =
        "<p>Error al cargar préstamos.</p>";
    });
}

function verificarPrestamoActivo(clienteId) {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${API_URL}/api/prestamos/cliente/${clienteId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(prestamos => {
      const div = document.getElementById(`prestamo-${clienteId}`);
      if (!div) return;

      // ✅ Si no hay préstamos activos
      if (!Array.isArray(prestamos) || prestamos.length === 0) {
        div.innerHTML = "— Sin préstamo activo";
        div.style.color = "gray";
        return;
      }

      const prestamo = prestamos[0];

      // ✅ SIEMPRE hay préstamo activo si llegamos aquí
      fetch(`${API_URL}/api/cuotas/prestamo/${prestamo.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(cuotas => {

          const hayPendientes =
            Array.isArray(cuotas) &&
            cuotas.some(c => c.estado === "pendiente");

          if (hayPendientes) {
            div.innerHTML = "💰 Préstamo activo";
          } else {
            // ✅ AQUI EL CAMBIO
            div.innerHTML = "✅ Cliente al día (con préstamo)";
          }

          div.style.color = "green";
        });
    })
    .catch(err => {
      console.error("Error verificando préstamo:", err);
    });
}

function actualizarTotalPagado(clienteId) {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(
    `${API_URL}/api/prestamos/cliente/${clienteId}/total-pagado?t=${Date.now()}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then(res => {
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    })
    .then(data => {
      const span = document.getElementById("totalPagado");
      if (span) {
        span.textContent = data.total_pagado;
      }
    })
    .catch(err => {
      console.error("Error actualizando total pagado:", err);
    });
}

function cargarHistorialPrestamos(clienteId) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No hay token");
    return;
  }

  fetch(`${API_URL}/api/prestamos/cliente/${clienteId}/historial`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    })
    .then(data => {
      const cont = document.getElementById("listaHistorial");
      cont.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        cont.innerHTML = "<p>Sin préstamos finalizados.</p>";
        return;
      }

      data.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        const montoLabel = document.createElement("strong");
        montoLabel.textContent = "Monto:";
        card.appendChild(montoLabel);
        card.appendChild(document.createTextNode(` $${p.monto}`));
        card.appendChild(document.createElement("br"));

        const totalLabel = document.createElement("strong");
        totalLabel.textContent = "Total:";
        card.appendChild(totalLabel);
        card.appendChild(document.createTextNode(` $${p.total}`));
        card.appendChild(document.createElement("br"));

        const plazoLabel = document.createElement("strong");
        plazoLabel.textContent = "Plazo:";
        card.appendChild(plazoLabel);
        card.appendChild(document.createTextNode(` ${p.plazo} (${p.tipo_cuota})`));
        card.appendChild(document.createElement("br"));

        const fechaLabel = document.createElement("strong");
        fechaLabel.textContent = "Fecha inicio:";
        card.appendChild(fechaLabel);
        card.appendChild(document.createTextNode(` ${new Date(p.fecha_inicio).toLocaleDateString()}`));
        card.appendChild(document.createElement("br"));

        const estadoLabel = document.createElement("strong");
        estadoLabel.textContent = "Estado:";
        card.appendChild(estadoLabel);
        card.appendChild(document.createTextNode(" ✅ Finalizado"));

        cont.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("listaHistorial").innerHTML =
        "<p>Error al cargar historial.</p>";
    });
}

function cargarResumenMoraCliente(clienteId) {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(`${API_URL}/api/prestamos/cliente/${clienteId}/mora-resumen`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.json())
    
    .then(data => {
      const div = document.getElementById(`prestamo-${clienteId}`);
      if (!div) return;

      // ❌ ELIMINADO: div.innerHTML = "";

      const wrapper = document.createElement("div");
      wrapper.style.marginTop = "4px";

      if (data.moroso) {
        wrapper.style.display = "inline-flex";
        wrapper.style.gap = "8px";
        wrapper.style.alignItems = "center";
        wrapper.style.flexWrap = "wrap";

        const badgeMoroso = document.createElement("span");
        badgeMoroso.style.background = "#dc3545";
        badgeMoroso.style.color = "white";
        badgeMoroso.style.padding = "2px 8px";
        badgeMoroso.style.borderRadius = "12px";
        badgeMoroso.style.fontSize = "12px";
        badgeMoroso.style.fontWeight = "bold";
        badgeMoroso.textContent = "🔴 Moroso";

        const badgeMora = document.createElement("span");
        badgeMora.style.background = "#f8f9da";
        badgeMora.style.color = "#842029";
        badgeMora.style.padding = "2px 8px";
        badgeMora.style.borderRadius = "12px";
        badgeMora.style.fontSize = "12px";
        badgeMora.textContent = `Mora: $${Number(data.mora_total).toFixed(2)}`;

        const badgeCuotas = document.createElement("span");
        badgeCuotas.style.background = "#fff3cd";
        badgeCuotas.style.color = "#664d03";
        badgeCuotas.style.padding = "2px 8px";
        badgeCuotas.style.borderRadius = "12px";
        badgeCuotas.style.fontSize = "12px";
        badgeCuotas.textContent = `${data.cuotas_atrasadas} cuotas`;

        wrapper.appendChild(badgeMoroso);
        wrapper.appendChild(badgeMora);
        wrapper.appendChild(badgeCuotas);
      } else {
        const badge = document.createElement("span");
        badge.style.background = "#198754";
        badge.style.color = "white";
        badge.style.padding = "2px 8px";
        badge.style.borderRadius = "12px";
        badge.style.fontSize = "12px";
        badge.textContent = "✅ Cliente al día";
        wrapper.appendChild(badge);
      }

      div.appendChild(wrapper);
    })
    .catch(err => console.error("Error mora cliente:", err));
}
function cargarListaNombresPrestamo() {
  const datalist = document.getElementById("listaNombres");
  if (!datalist || !Array.isArray(clientesCache)) return;

  datalist.innerHTML = "";

  clientesCache.forEach(cliente => {
    const option = document.createElement("option");
    option.value = cliente.nombre;     // ✅ visible
    option.dataset.id = cliente.id;    // ✅ oculto
    datalist.appendChild(option);
  });
}

function precargarEstadoClientes(clientes) {
  const token = localStorage.getItem("token");
  if (!token) return;

  let pendientes = clientes.length;

  clientes.forEach(cliente => {
    fetch(`${API_URL}/api/prestamos/cliente/${cliente.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(prestamos => {

        if (!prestamos.length) {
          estadoClientesCache[cliente.id] = { estado: "sin_prestamo" };

          pendientes--;
          if (pendientes === 0) renderClientes(clientesCache); // ✅ SOLO UNA VEZ
          return;
        }

        const prestamo = prestamos[0];

        fetch(`${API_URL}/api/cuotas/prestamo/${prestamo.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(cuotas => {

            const hayPendientes = cuotas.some(c => c.estado === "pendiente");

            estadoClientesCache[cliente.id] = {
              estado: hayPendientes ? "activo" : "al_dia"
            };

            pendientes--;
            if (pendientes === 0) renderClientes(clientesCache); // ✅ SOLO UNA VEZ
          });

      })
      .catch(err => {
        console.error(err);
        pendientes--;
      });
  });
}

const tipo = document.getElementById("tipoRespaldo");
const formFiador = document.getElementById("formFiador");
const formGarantia = document.getElementById("formGarantia");
const tipoExistente = document.getElementById("tipoRespaldoExistente");
const formFiadorExistente = document.getElementById("formFiadorExistente");
const formGarantiaExistente = document.getElementById("formGarantiaExistente");

tipo.addEventListener("change", () => {
  if (tipo.value === "fiador") {
    formFiador.style.display = "block";
    formGarantia.style.display = "none";

    cargarTrabajosAdmin();

  } else if (tipo.value === "garantia") {
    formGarantia.style.display = "block";
    formFiador.style.display = "none";
  } else {
    formFiador.style.display = "none";
    formGarantia.style.display = "none";
  }
});

if (tipoExistente) {
  tipoExistente.addEventListener("change", () => {
    if (tipoExistente.value === "fiador") {
      formFiadorExistente.style.display = "block";
      formGarantiaExistente.style.display = "none";
      cargarTrabajosAdmin();
    } else if (tipoExistente.value === "garantia") {
      formGarantiaExistente.style.display = "block";
      formFiadorExistente.style.display = "none";
    } else {
      formFiadorExistente.style.display = "none";
      formGarantiaExistente.style.display = "none";
    }
  });
}

document.getElementById("fiadorMunicipio").addEventListener("change", function () {
  const municipioId = this.value;

  if (!municipioId) return;

  cargarBarrios(municipioId, "listaBarriosFiador");
});

document.getElementById("fiadorMunicipioExistente").addEventListener("change", function () {
  const municipioId = this.value;

  if (!municipioId) return;

  cargarBarrios(municipioId, "listaBarriosFiadorExistente");
});

document.getElementById("fiadorMunicipioExistente").addEventListener("change", function () {
  const municipioId = this.value;

  if (!municipioId) return;

  cargarBarrios(municipioId, "listaBarriosFiadorExistente");
});

function mostrarVistaPrestamos(vista) {

  document.getElementById(
    "vistaNuevoPrestamo"
  ).style.display = "none";

  document.getElementById(
    "vistaPrestamoExistente"
  ).style.display = "none";

  document.getElementById(
    "vistaPrestamosActivos"
  ).style.display = "none";

  document.getElementById(vista)
    .style.display = "block";

  document
    .querySelectorAll(".tab-prestamo")
    .forEach(btn => {
      btn.classList.remove("activo");
    });

  if (vista === "vistaNuevoPrestamo") {

    document
      .getElementById("btnVistaNuevoPrestamo")
      .classList.add("activo");

  }

  if (vista === "vistaPrestamoExistente") {

    document
      .getElementById("btnVistaPrestamoExistente")
      .classList.add("activo");

  }

  if (vista === "vistaPrestamosActivos") {

    document
      .getElementById("btnVistaPrestamosActivos")
      .classList.add("activo");

    cargarPrestamosActivos();

  }

}


document.getElementById("btnVistaNuevoPrestamo")
  .addEventListener("click", () => {

    mostrarVistaPrestamos(
      "vistaNuevoPrestamo"
    );

  });

document.getElementById("btnVistaPrestamoExistente")
  .addEventListener("click", () => {

    mostrarVistaPrestamos(
      "vistaPrestamoExistente"
    );

  });

document.getElementById("btnVistaPrestamosActivos")
  .addEventListener("click", () => {

    mostrarVistaPrestamos(
      "vistaPrestamosActivos"
    );

  });

function cargarPrestamosActivos() {

  const token = localStorage.getItem("token");

  fetch(
    `${API_URL}/api/prestamos/activos`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then(res => res.json())
    .then(data => {

      const cont =
        document.getElementById(
          "listaPrestamosActivos"
        );

      cont.innerHTML = "";

      if (!data.length) {

        cont.innerHTML =
          "<p>No hay préstamos activos.</p>";

        return;
      }

      data.forEach(prestamo => {

        const card =
          document.createElement("div");

        card.className = "card prestamo-activo-card";

        card.innerHTML = `
          <strong>Cliente:</strong>
          ${prestamo.cliente}<br>

          <strong>Monto:</strong>
          C$${prestamo.monto}<br>

          <strong>Total:</strong>
          C$${prestamo.total}<br>

          <strong>Plazo:</strong>
          ${prestamo.plazo}
          (${prestamo.tipo_cuota})<br>

          <strong>Fecha:</strong>
          ${new Date(
            prestamo.fecha_inicio
          ).toLocaleDateString()}
  
          <br><br>

          <button
            class="btn-anular-prestamo"
            data-id="${prestamo.id}">
              ❌ Anular
          </button>
        `;

        cont.appendChild(card);

      const btn =
        card.querySelector(
          ".btn-anular-prestamo"
        );

        btn.addEventListener(
        "click",
          () => anularPrestamo(prestamo.id)
        );


      });

    })
    .catch(err => {

      console.error(err);

    });

}

function anularPrestamo(prestamoId){

  const motivo = prompt(
    "Motivo de la anulación:"
  );

  if(!motivo){
    return;
  }

  fetch(
    `${API_URL}/api/prestamos/${prestamoId}/anular`,
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:
          `Bearer ${localStorage.getItem("token")}`
      },
      body:JSON.stringify({
        motivo
      })
    }
  )
  .then(async res => {

    const data = await res.json();

    if(!res.ok){
      throw new Error(
        data.mensaje || "Error"
      );
    }

    return data;

  })
  .then(data => {

    mostrarToast(data.mensaje, "success");

    cargarPrestamosActivos();

  })
  .catch(err => {

    mostrarToast(err.message, "error");

  });

}