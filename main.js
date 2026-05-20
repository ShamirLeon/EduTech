const STORAGE_KEY = "edutech-instituciones";

const form = document.getElementById("form-institucion");
const formError = document.getElementById("form-error");
const lista = document.getElementById("lista-instituciones");
const listaVacia = document.getElementById("lista-vacia");
const contador = document.getElementById("contador");
const toast = document.getElementById("toast");

const TIPO_LABEL = {
  colegio: "Colegio",
  instituto: "Instituto",
  universidad: "Universidad",
};

function cargarInstituciones() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);
    return datos ? JSON.parse(datos) : [];
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

function mostrarError(mensaje) {
  formError.textContent = mensaje;
  formError.classList.remove("hidden");
}

function ocultarError() {
  formError.textContent = "";
  formError.classList.add("hidden");
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

function crearTarjeta(institucion) {
  const li = document.createElement("li");
  li.className =
    "rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
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
    <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-3">
      <div>
        <dt class="text-xs text-slate-500">Código</dt>
        <dd class="font-mono font-medium">${escapeHtml(institucion.codigo)}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-500">Tipo</dt>
        <dd>${escapeHtml(TIPO_LABEL[institucion.tipo] ?? institucion.tipo)}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-500">Registrada</dt>
        <dd>${formatearFecha(institucion.creadaEn)}</dd>
      </div>
    </dl>
  `;
  return li;
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function renderizarLista() {
  const instituciones = cargarInstituciones();
  contador.textContent = String(instituciones.length);

  lista.innerHTML = "";

  if (instituciones.length === 0) {
    lista.classList.add("hidden");
    listaVacia.classList.remove("hidden");
    return;
  }

  listaVacia.classList.add("hidden");
  lista.classList.remove("hidden");

  instituciones
    .slice()
    .sort((a, b) => new Date(b.creadaEn) - new Date(a.creadaEn))
    .forEach((inst) => lista.appendChild(crearTarjeta(inst)));
}

function registrarInstitucion(datos) {
  const instituciones = cargarInstituciones();
  const codigo = normalizarCodigo(datos.codigo);

  if (instituciones.some((i) => i.codigo === codigo)) {
    mostrarError(`Ya existe una institución con el código "${codigo}".`);
    return false;
  }

  const nueva = {
    id: crypto.randomUUID(),
    nombre: datos.nombre.trim(),
    codigo,
    tipo: datos.tipo,
    correo: datos.correo.trim().toLowerCase(),
    creadaEn: new Date().toISOString(),
  };

  guardarInstituciones([nueva, ...instituciones]);
  return nueva;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  ocultarError();

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

renderizarLista();
