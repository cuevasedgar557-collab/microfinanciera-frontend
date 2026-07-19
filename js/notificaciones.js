function cargarNotificaciones() {

  const token = localStorage.getItem("token");

  fetch(
    `${API_URL}/api/mensajes/mis-notificaciones`,
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
          "listaNotificaciones"
        );

      cont.innerHTML = "";

      if (!data.length) {

        cont.innerHTML =
          "<p>No tienes notificaciones.</p>";

        return;

      }

      data.forEach(notificacion => {

        const card =
          document.createElement("div");

        card.className =
          "card notificacion-card";

        card.innerHTML = `

          <h3>${notificacion.titulo}</h3>

          <p>
            <strong>Prioridad:</strong>
            ${notificacion.prioridad}
          </p>

          <p>
            <strong>📤 Enviado por:</strong>
            ${notificacion.remitente}
          </p>

          <p>
            ${notificacion.mensaje}
          </p>

          <p>
            <strong>Fecha:</strong>
            ${new Date(
              notificacion.fecha
            ).toLocaleString()}
          </p>

          <p>
            <strong>Leído:</strong>
            ${notificacion.leido ? "✅" : "❌"}
          </p>

          <p>
            <strong>Confirmado:</strong>
            ${notificacion.confirmado ? "✅" : "❌"}
          </p>

          ${
            !notificacion.leido
            ?
            `
              <button
                class="btn-leer"
                data-id="${notificacion.id}">
                ✓ Marcar leído
              </button>
            `
            : ""
          }

          ${
            !notificacion.confirmado
            ?
            `
              <button
                class="btn-confirmar"
                data-id="${notificacion.id}">
                ✓ Entendido
              </button>
            `
            : ""
          }

          <button
            class="btn-eliminar"
            data-id="${notificacion.id}">
            🗑 Eliminar
          </button>

        `;

        cont.appendChild(card);

      });

      // Marcar leído
      document
        .querySelectorAll(".btn-leer")
        .forEach(btn => {

          btn.addEventListener(
            "click",
            () => marcarLeido(
              btn.dataset.id
            )
          );

        });

      // Confirmar
      document
        .querySelectorAll(".btn-confirmar")
        .forEach(btn => {

          btn.addEventListener(
            "click",
            () => confirmarNotificacion(
              btn.dataset.id
            )
          );

        });

      // Eliminar
      document
        .querySelectorAll(".btn-eliminar")
        .forEach(btn => {

          btn.addEventListener(
            "click",
            () => eliminarNotificacion(
              btn.dataset.id
            )
          );

        });

    })
    .catch(err => {

      console.error(err);

    });

}

function marcarLeido(id) {

  const token = localStorage.getItem("token");

  fetch(
    `${API_URL}/api/mensajes/${id}/leido`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .then(() => {

    cargarNotificaciones();
    cargarPanelNotificaciones();

  });

}

function confirmarNotificacion(id) {

  const token = localStorage.getItem("token");

  fetch(
    `${API_URL}/api/mensajes/${id}/confirmar`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .then(() => {

    cargarNotificaciones();
    cargarPanelNotificaciones();

  });

}


function cargarDestinatariosNotificacion() {

  const token =
    localStorage.getItem("token");

  fetch(
    `${API_URL}/api/usuarios`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then(res => res.json())
    .then(usuarios => {

      const select =
        document.getElementById(
          "destinatarioNotificacion"
        );

      select.innerHTML = `
        <option value="todos">
          Todos los trabajadores
        </option>
      `;

      usuarios.forEach(usuario => {

        if (
          usuario.rol ===
          "trabajador"
        ) {

          select.innerHTML += `
            <option value="${usuario.id}">
              ${usuario.nombre}
            </option>
          `;

        }

      });

    });

}

function enviarNotificacion() {

  const token =
    localStorage.getItem("token");

  const titulo =
    document.getElementById(
      "tituloNotificacion"
    ).value;

  const mensaje =
    document.getElementById(
      "mensajeNotificacion"
    ).value;

  const prioridad =
    document.getElementById(
      "prioridadNotificacion"
    ).value;

  const destinatario =
    document.getElementById(
      "destinatarioNotificacion"
    ).value;

  let body = {
    titulo,
    mensaje,
    prioridad
  };

  if (
    destinatario === "todos"
  ) {

    body.paraTodos = true;

  } else {

    body.usuario_id =
      Number(destinatario);

  }

  fetch(
    `${API_URL}/api/mensajes`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",

        Authorization:
          `Bearer ${token}`
      },

      body: JSON.stringify(body)
    }
  )
    .then(res => res.json())
    .then(data => {

      mostrarToast(data.mensaje, "success");

      document.getElementById(
        "tituloNotificacion"
      ).value = "";

      document.getElementById(
        "mensajeNotificacion"
      ).value = "";

    });

}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const btn =
      document.getElementById(
        "btnEnviarNotificacion"
      );

    if (btn) {

      btn.addEventListener(
        "click",
        enviarNotificacion
      );

    }

  }
);

function eliminarNotificacion(id) {

  const token =
    localStorage.getItem("token");

  fetch(
    `${API_URL}/api/mensajes/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .then(data => {
        cargarNotificaciones();
        cargarPanelNotificaciones();
      });
}

function limpiarNotificacionesAtendidas() {

  const token =
    localStorage.getItem("token");

  fetch(
    `${API_URL}/api/mensajes/limpiar/atendidas`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .then(res => res.json())
  .then(data => {

    mostrarToast(data.mensaje, "success");

    cargarNotificaciones();
    cargarPanelNotificaciones();

  });

}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const btnLimpiar =
      document.getElementById(
        "btnLimpiarNotificaciones"
      );

    if (btnLimpiar) {

      btnLimpiar.addEventListener(
        "click",
        limpiarNotificacionesAtendidas
      );

    }

  }
);

function cargarHistorialNotificaciones() {

  const token =
    localStorage.getItem("token");

  fetch(
    `${API_URL}/api/mensajes/enviados`,
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
          "historialNotificaciones"
        );

      cont.innerHTML = "";

      if (!data.length) {

        cont.innerHTML =
          "<p>No hay mensajes enviados.</p>";

        return;

      }

      data.forEach(mensaje => {

        const card =
          document.createElement("div");

        card.className =
          "card";

        card.innerHTML = `

        <h4>${mensaje.titulo}</h4>

        <p>
          <strong>Prioridad:</strong>
          ${mensaje.prioridad}
        </p>

        <p>
          <strong>Fecha:</strong>
            ${new Date(
            mensaje.fecha
            ).toLocaleString()}
        </p>

        <p>
          <strong>Leídos:</strong>
          ${mensaje.leidos}/${mensaje.total}
        </p>

        <p>
          <strong>Confirmados:</strong>
          ${mensaje.confirmados}/${mensaje.total}
        </p>

        <p>
          <strong>⏳ Expira en:</strong>
          ${mensaje.dias_restantes} días
        </p>

        <button
          class="btn-detalle-notificacion"
          data-id="${mensaje.id}">
          Ver detalle
        </button>

        <div
          id="detalle-${mensaje.id}"
          style="margin-top:15px;">
        </div>

            `;


        cont.appendChild(card);

      });

      document
        .querySelectorAll(
          ".btn-detalle-notificacion"
        )
        .forEach(btn => {

          btn.addEventListener(
            "click",
            () => verDetalleNotificacion(
              btn.dataset.id
            )
          );

        });

    });

}

function verDetalleNotificacion(id) {

  const cont =
    document.getElementById(
      `detalle-${id}`
    );

  const btn =
    document.querySelector(
      `.btn-detalle-notificacion[data-id="${id}"]`
    );

  // Si ya está abierto, cerrar
  if (cont.innerHTML.trim() !== "") {

    cont.innerHTML = "";

    if (btn) {
      btn.textContent =
        "Ver detalle";
    }

    return;

  }

  if (btn) {
    btn.textContent =
      "Cerrar detalle";
  }

  const token =
    localStorage.getItem("token");

  fetch(
    `${API_URL}/api/mensajes/${id}/detalle`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then(res => res.json())
    .then(data => {

      cont.innerHTML = "";

      data.forEach(usuario => {

        const fechaLectura =
          usuario.fecha_lectura
            ? new Date(
                usuario.fecha_lectura
              ).toLocaleString()
            : "Sin registrar";

        const fechaConfirmacion =
          usuario.fecha_confirmacion
            ? new Date(
                usuario.fecha_confirmacion
              ).toLocaleString()
            : "Sin registrar";

        cont.innerHTML += `

          <div
            style="
              padding:12px;
              margin-top:10px;
              border:1px solid #ddd;
              border-radius:8px;
              background:#f9fafb;
            ">

            <h4>
              👤 ${usuario.nombre}
            </h4>

            <p>
              ${
                usuario.leido
                  ? "✅ Leído"
                  : "❌ No leído"
              }
            </p>

            <p>
              📅 Lectura:
              ${fechaLectura}
            </p>

            <p>
              ${
                usuario.confirmado
                  ? "✅ Confirmado"
                  : "❌ No confirmado"
              }
            </p>

            <p>
              📅 Confirmación:
              ${fechaConfirmacion}
            </p>

          </div>

        `;

      });

    })
    .catch(err => {

      console.error(err);

      if (btn) {
        btn.textContent =
          "Ver detalle";
      }

    });

}

function togglePanelNotificaciones() {

  const panel =
    document.getElementById(
      "panelNotificaciones"
    );

  panel.classList.toggle(
    "abierto"
  );

  if (
    panel.classList.contains(
      "abierto"
    )
  ) {

    cargarPanelNotificaciones();

  }

}

function cargarPanelNotificaciones() {

  const token =
    localStorage.getItem("token");

  fetch(
    `${API_URL}/api/mensajes/mis-notificaciones`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then(res => res.json())
    .then(data => {

      const noLeidas =
        data.filter(
          notificacion => !notificacion.leido
        ).length;

      document.getElementById(
        "contadorNotificaciones"
      ).textContent = noLeidas;

      const cont =
        document.getElementById(
          "contenidoPanelNotificaciones"
        );

      cont.innerHTML = "";

      if (!data.length) {

        cont.innerHTML = `
          <p>
            No hay notificaciones.
          </p>
        `;

      } else {

        data.slice(0, 5).forEach(notificacion => {

          cont.innerHTML += `

            <div
              class="item-panel-notificacion">

              <strong>
                ${notificacion.titulo}
              </strong>

              <br>

              <small>
                ${notificacion.remitente}
              </small>

            </div>

          `;

        });

      }

      cont.innerHTML += `

        <hr>

        <div
          class="item-panel-accion"
          onclick="
            togglePanelNotificaciones();
            mostrarSeccion('notificaciones');
          ">

          🔔 Ver todas las notificaciones

        </div>

      `;

      const datosUsuario =
        obtenerDatosUsuarioDesdeToken();

      if (
        datosUsuario &&
        datosUsuario.rol === "administrador"
      ) {

        cont.innerHTML += `

          <div
            class="item-panel-accion"
            onclick="
              togglePanelNotificaciones();
              mostrarSeccion('adminNotificaciones');
            ">

            ⚙ Administrar notificaciones

          </div>

        `;

      }

    })
    .catch(err => {

      console.error(
        "Error cargando notificaciones:",
        err
      );

    });

}

window.addEventListener(
  "load",
  () => {

    cargarPanelNotificaciones();

  }
);