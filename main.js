const STORAGE_KEY = "edutech-instituciones";

const form = document.getElementById("form-institucion");
const formError = document.getElementById("form-error");
const lista = document.getElementById("lista-instituciones");
const listaVacia = document.getElementById("lista-vacia");
const contador = document.getElementById("contador");
const toast = document.getElementById("toast");

const sedesSinInstituciones = document.getElementById("sedes-sin-instituciones");
const sedesPanel = document.getElementById("sedes-panel");
const selectInstitucion = document.getElementById("institucion-sede");
const formSede = document.getElementById("form-sede");
const formSedeError = document.getElementById("form-sede-error");
const listaSedes = document.getElementById("lista-sedes");
const listaSedesVacia = document.getElementById("lista-sedes-vacia");
const contadorSedes = document.getElementById("contador-sedes");
const sedeInstitucionNombre = document.getElementById("sede-institucion-nombre");

const TIPO_LABEL = {
  colegio: "Colegio",
  instituto: "Instituto",
  universidad: "Universidad",
};

function cargarInstituciones() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);
    const lista = datos ? JSON.parse(datos) : [];
    return lista.map((inst) => ({
      ...inst,
      sedes: inst.sedes ?? [],
    }));
  } catch {
    return [];
  }
}

function guardarInstituciones(instituciones) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(instituciones));
}

function normalizarCodigo(codigo) {
  return codigo.trim().toUpperCase();
}

function mostrarError(elemento, mensaje) {
  elemento.textContent = mensaje;
  elemento.classList.remove("hidden");
}

function ocultarError(elemento) {
  elemento.textContent = "";
  elemento.classList.add("hidden");
}

function mostrarToast(mensaje) {
  toast.textContent = mensaje;
  toast.classList.remove("opacity-0", "translate-y-4");
  toast.classList.add("opacity-100", "translate-y-0");

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-4");
    toast.classList.remove("opacity-100", "translate-y-0");
  }, 2800);
}

function formatearFecha(iso) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function obtenerInstitucionSeleccionada() {
  const id = selectInstitucion.value;
  if (!id) return null;
  return cargarInstituciones().find((i) => i.id === id) ?? null;
}

function crearTarjeta(institucion) {
  const numSedes = (institucion.sedes ?? []).length;
  const li = document.createElement("li");
  li.className = "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
  li.innerHTML = `
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 class="font-semibold text-slate-900">${escapeHtml(institucion.nombre)}</h3>
        <p class="mt-0.5 text-sm text-slate-500">${escapeHtml(institucion.correo)}</p>
      </div>
      <span class="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        Acceso habilitado
      </span>
    </div>
    <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-4">
      <div>
        <dt class="text-xs text-slate-500">Código</dt>
        <dd class="font-mono font-medium">${escapeHtml(institucion.codigo)}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-500">Tipo</dt>
        <dd>${escapeHtml(TIPO_LABEL[institucion.tipo] ?? institucion.tipo)}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-500">Sedes</dt>
        <dd>${numSedes}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-500">Registrada</dt>
        <dd>${formatearFecha(institucion.creadaEn)}</dd>
      </div>
    </dl>
    <button
      type="button"
      data-inst-id="${institucion.id}"
      class="btn-gestionar-sedes mt-3 text-sm font-medium text-teal-600 hover:text-teal-800"
    >
      Gestionar sedes →
    </button>
  `;
  return li;
}

function renderizarLista() {
  const instituciones = cargarInstituciones();
  contador.textContent = String(instituciones.length);

  lista.innerHTML = "";

  if (instituciones.length === 0) {
    lista.classList.add("hidden");
    listaVacia.classList.remove("hidden");
    renderizarPanelSedes();
    return;
  }

  listaVacia.classList.add("hidden");
  lista.classList.remove("hidden");

  instituciones
    .slice()
    .sort((a, b) => new Date(b.creadaEn) - new Date(a.creadaEn))
    .forEach((inst) => lista.appendChild(crearTarjeta(inst)));

  lista.querySelectorAll(".btn-gestionar-sedes").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectInstitucion.value = btn.dataset.instId;
      renderizarSedes();
      sedesPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  renderizarPanelSedes();
}

function renderizarPanelSedes() {
  const instituciones = cargarInstituciones();

  if (instituciones.length === 0) {
    sedesSinInstituciones.classList.remove("hidden");
    sedesPanel.classList.add("hidden");
    return;
  }

  sedesSinInstituciones.classList.add("hidden");
  sedesPanel.classList.remove("hidden");

  const valorPrevio = selectInstitucion.value;
  selectInstitucion.innerHTML = instituciones
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map(
      (inst) =>
        `<option value="${inst.id}">${escapeHtml(inst.nombre)} (${escapeHtml(inst.codigo)})</option>`,
    )
    .join("");

  const existe = instituciones.some((i) => i.id === valorPrevio);
  selectInstitucion.value = existe ? valorPrevio : instituciones[0].id;

  renderizarSedes();
}

function crearTarjetaSede(sede, institucionId) {
  const li = document.createElement("li");
  li.className =
    "flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3";
  li.innerHTML = `
    <div class="min-w-0 flex-1">
      <p class="font-medium text-slate-900">${escapeHtml(sede.nombre)}</p>
      <p class="mt-0.5 text-sm text-slate-500">${escapeHtml(sede.direccion)}</p>
      <p class="mt-1 font-mono text-xs text-slate-400">${escapeHtml(sede.codigo)}</p>
    </div>
    <button
      type="button"
      data-sede-id="${sede.id}"
      data-inst-id="${institucionId}"
      class="btn-eliminar-sede shrink-0 text-sm text-red-600 hover:text-red-800"
    >
      Eliminar
    </button>
  `;
  return li;
}

function renderizarSedes() {
  const institucion = obtenerInstitucionSeleccionada();
  if (!institucion) return;

  sedeInstitucionNombre.textContent = institucion.nombre;
  const sedes = institucion.sedes ?? [];
  contadorSedes.textContent = String(sedes.length);

  listaSedes.innerHTML = "";

  if (sedes.length === 0) {
    listaSedes.classList.add("hidden");
    listaSedesVacia.classList.remove("hidden");
    return;
  }

  listaSedesVacia.classList.add("hidden");
  listaSedes.classList.remove("hidden");

  sedes
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .forEach((sede) => {
      const tarjeta = crearTarjetaSede(sede, institucion.id);
      tarjeta
        .querySelector(".btn-eliminar-sede")
        .addEventListener("click", () => eliminarSede(institucion.id, sede.id));
      listaSedes.appendChild(tarjeta);
    });
}

function registrarInstitucion(datos) {
  const instituciones = cargarInstituciones();
  const codigo = normalizarCodigo(datos.codigo);

  if (instituciones.some((i) => i.codigo === codigo)) {
    mostrarError(formError, `Ya existe una institución con el código "${codigo}".`);
    return false;
  }

  const nueva = {
    id: crypto.randomUUID(),
    nombre: datos.nombre.trim(),
    codigo,
    tipo: datos.tipo,
    correo: datos.correo.trim().toLowerCase(),
    creadaEn: new Date().toISOString(),
    sedes: [],
  };

  guardarInstituciones([nueva, ...instituciones]);
  return nueva;
}

function registrarSede(institucionId, datos) {
  const instituciones = cargarInstituciones();
  const indice = instituciones.findIndex((i) => i.id === institucionId);
  if (indice === -1) return false;

  const codigo = normalizarCodigo(datos.codigo);
  const sedes = instituciones[indice].sedes ?? [];

  if (sedes.some((s) => s.codigo === codigo)) {
    mostrarError(
      formSedeError,
      `Ya existe una sede con el código "${codigo}" en esta institución.`,
    );
    return false;
  }

  const nueva = {
    id: crypto.randomUUID(),
    nombre: datos.nombre.trim(),
    codigo,
    direccion: datos.direccion.trim(),
    creadaEn: new Date().toISOString(),
  };

  instituciones[indice].sedes = [nueva, ...sedes];
  guardarInstituciones(instituciones);
  return nueva;
}

function eliminarSede(institucionId, sedeId) {
  const instituciones = cargarInstituciones();
  const indice = instituciones.findIndex((i) => i.id === institucionId);
  if (indice === -1) return;

  const sede = instituciones[indice].sedes.find((s) => s.id === sedeId);
  if (!sede) return;

  instituciones[indice].sedes = instituciones[indice].sedes.filter(
    (s) => s.id !== sedeId,
  );
  guardarInstituciones(instituciones);
  renderizarLista();
  mostrarToast(`Sede "${sede.nombre}" eliminada.`);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  ocultarError(formError);

  const formData = new FormData(form);
  const datos = {
    nombre: formData.get("nombre"),
    codigo: formData.get("codigo"),
    tipo: formData.get("tipo"),
    correo: formData.get("correo"),
  };

  const registrada = registrarInstitucion(datos);
  if (!registrada) return;

  form.reset();
  renderizarLista();
  mostrarToast(`"${registrada.nombre}" registrada correctamente.`);
});

formSede.addEventListener("submit", (event) => {
  event.preventDefault();
  ocultarError(formSedeError);

  const institucion = obtenerInstitucionSeleccionada();
  if (!institucion) return;

  const formData = new FormData(formSede);
  const registrada = registrarSede(institucion.id, {
    nombre: formData.get("nombre"),
    codigo: formData.get("codigo"),
    direccion: formData.get("direccion"),
  });

  if (!registrada) return;

  formSede.reset();
  renderizarLista();
  mostrarToast(`Sede "${registrada.nombre}" agregada.`);
});

selectInstitucion.addEventListener("change", renderizarSedes);

renderizarLista();
