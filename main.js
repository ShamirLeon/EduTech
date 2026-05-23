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

const cursosSinInstituciones = document.getElementById("cursos-sin-instituciones");
const cursosSinSedes = document.getElementById("cursos-sin-sedes");
const cursosPanel = document.getElementById("cursos-panel");
const selectInstitucionCurso = document.getElementById("institucion-curso");
const selectSedeCurso = document.getElementById("sede-curso");
const formCurso = document.getElementById("form-curso");
const formCursoError = document.getElementById("form-curso-error");
const listaCursos = document.getElementById("lista-cursos");
const listaCursosVacia = document.getElementById("lista-cursos-vacia");
const contadorCursos = document.getElementById("contador-cursos");
const cursoSedeNombre = document.getElementById("curso-sede-nombre");

const docentesSinInstituciones = document.getElementById("docentes-sin-instituciones");
const docentesSinSedes = document.getElementById("docentes-sin-sedes");
const docentesSinCursos = document.getElementById("docentes-sin-cursos");
const docentesPanel = document.getElementById("docentes-panel");
const selectInstitucionDocente = document.getElementById("institucion-docente");
const selectSedeDocente = document.getElementById("sede-docente");
const selectCursoDocente = document.getElementById("curso-docente");
const formDocente = document.getElementById("form-docente");
const formDocenteError = document.getElementById("form-docente-error");
const listaDocentes = document.getElementById("lista-docentes");
const listaDocentesVacia = document.getElementById("lista-docentes-vacia");
const contadorDocentes = document.getElementById("contador-docentes");
const docenteCursoNombre = document.getElementById("docente-curso-nombre");

const TIPO_LABEL = {
  colegio: "Colegio",
  instituto: "Instituto",
  universidad: "Universidad",
};

const NIVEL_LABEL = {
  preescolar: "Preescolar",
  primaria: "Primaria",
  secundaria: "Secundaria",
  preparatoria: "Preparatoria",
  licenciatura: "Licenciatura",
  posgrado: "Posgrado",
};

function normalizarInstitucion(inst) {
  return {
    ...inst,
    sedes: (inst.sedes ?? []).map((sede) => ({
      ...sede,
      cursos: (sede.cursos ?? []).map((curso) => ({
        ...curso,
        docentes: curso.docentes ?? [],
      })),
    })),
  };
}

function cargarInstituciones() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);
    const lista = datos ? JSON.parse(datos) : [];
    return lista.map(normalizarInstitucion);
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

function opcionesInstituciones(instituciones) {
  return instituciones
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map(
      (inst) =>
        `<option value="${inst.id}">${escapeHtml(inst.nombre)} (${escapeHtml(inst.codigo)})</option>`,
    )
    .join("");
}

function obtenerInstitucionPorId(id) {
  return cargarInstituciones().find((i) => i.id === id) ?? null;
}

function obtenerInstitucionSeleccionadaSedes() {
  const id = selectInstitucion.value;
  if (!id) return null;
  return obtenerInstitucionPorId(id);
}

function obtenerSedeSeleccionada(selectInst, selectSede) {
  const instId = selectInst.value;
  const sedeId = selectSede.value;
  if (!instId || !sedeId) return null;

  const institucion = obtenerInstitucionPorId(instId);
  if (!institucion) return null;

  const sede = institucion.sedes.find((s) => s.id === sedeId);
  if (!sede) return null;

  return { institucion, sede };
}

function obtenerCursoSeleccionado() {
  const seleccion = obtenerSedeSeleccionada(
    selectInstitucionDocente,
    selectSedeDocente,
  );
  if (!seleccion) return null;

  const cursoId = selectCursoDocente.value;
  if (!cursoId) return null;

  const curso = seleccion.sede.cursos.find((c) => c.id === cursoId);
  if (!curso) return null;

  return { ...seleccion, curso };
}

function contarDocentes(institucion) {
  return institucion.sedes.reduce(
    (total, sede) =>
      total +
      sede.cursos.reduce((suma, curso) => suma + curso.docentes.length, 0),
    0,
  );
}

function codigoDocenteEnInstitucion(institucion, codigo) {
  const normalizado = normalizarCodigo(codigo);
  return institucion.sedes.some((sede) =>
    sede.cursos.some((curso) =>
      curso.docentes.some((d) => d.codigo === normalizado),
    ),
  );
}

function encontrarCurso(instituciones, institucionId, sedeId, cursoId) {
  const indiceInst = instituciones.findIndex((i) => i.id === institucionId);
  if (indiceInst === -1) return null;

  const indiceSede = instituciones[indiceInst].sedes.findIndex(
    (s) => s.id === sedeId,
  );
  if (indiceSede === -1) return null;

  const indiceCurso = instituciones[indiceInst].sedes[indiceSede].cursos.findIndex(
    (c) => c.id === cursoId,
  );
  if (indiceCurso === -1) return null;

  return { indiceInst, indiceSede, indiceCurso };
}

function irAPanel(elemento) {
  elemento.scrollIntoView({ behavior: "smooth", block: "start" });
}

function crearTarjeta(institucion) {
  const numSedes = institucion.sedes.length;
  const numCursos = institucion.sedes.reduce(
    (total, sede) => total + sede.cursos.length,
    0,
  );
  const numDocentes = contarDocentes(institucion);
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
    <dl class="mt-3 grid gap-2 text-sm sm:grid-cols-3 lg:grid-cols-6">
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
        <dt class="text-xs text-slate-500">Cursos</dt>
        <dd>${numCursos}</dd>
      </div>
      <div>
        <dt class="text-xs text-slate-500">Docentes</dt>
        <dd>${numDocentes}</dd>
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
    renderizarPanelCursos();
    renderizarPanelDocentes();
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
      irAPanel(sedesPanel);
    });
  });

  renderizarPanelSedes();
  renderizarPanelCursos();
  renderizarPanelDocentes();
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
  selectInstitucion.innerHTML = opcionesInstituciones(instituciones);

  const existe = instituciones.some((i) => i.id === valorPrevio);
  selectInstitucion.value = existe ? valorPrevio : instituciones[0].id;

  renderizarSedes();
}

function crearTarjetaSede(sede, institucion) {
  const li = document.createElement("li");
  li.className =
    "flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3";
  li.innerHTML = `
    <div class="min-w-0 flex-1">
      <p class="font-medium text-slate-900">${escapeHtml(sede.nombre)}</p>
      <p class="mt-0.5 text-sm text-slate-500">${escapeHtml(sede.direccion)}</p>
      <p class="mt-1 text-xs text-slate-400">
        <span class="font-mono">${escapeHtml(sede.codigo)}</span>
        · ${sede.cursos.length} curso${sede.cursos.length === 1 ? "" : "s"}
      </p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        data-inst-id="${institucion.id}"
        data-sede-id="${sede.id}"
        class="btn-gestionar-cursos text-sm font-medium text-violet-600 hover:text-violet-800"
      >
        Cursos →
      </button>
      <button
        type="button"
        data-sede-id="${sede.id}"
        data-inst-id="${institucion.id}"
        class="btn-eliminar-sede text-sm text-red-600 hover:text-red-800"
      >
        Eliminar
      </button>
    </div>
  `;
  return li;
}

function renderizarSedes() {
  const institucion = obtenerInstitucionSeleccionadaSedes();
  if (!institucion) return;

  sedeInstitucionNombre.textContent = institucion.nombre;
  const sedes = institucion.sedes;
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
      const tarjeta = crearTarjetaSede(sede, institucion);
      tarjeta
        .querySelector(".btn-eliminar-sede")
        .addEventListener("click", () => eliminarSede(institucion.id, sede.id));
      tarjeta.querySelector(".btn-gestionar-cursos").addEventListener("click", (e) => {
        const { instId, sedeId } = e.currentTarget.dataset;
        selectInstitucionCurso.value = instId;
        renderizarSelectSedesCursos();
        selectSedeCurso.value = sedeId;
        renderizarCursos();
        irAPanel(cursosPanel);
      });
      listaSedes.appendChild(tarjeta);
    });
}

function renderizarPanelCursos() {
  const instituciones = cargarInstituciones();

  if (instituciones.length === 0) {
    cursosSinInstituciones.classList.remove("hidden");
    cursosSinSedes.classList.add("hidden");
    cursosPanel.classList.add("hidden");
    return;
  }

  cursosSinInstituciones.classList.add("hidden");

  const valorInstPrevio = selectInstitucionCurso.value;
  selectInstitucionCurso.innerHTML = opcionesInstituciones(instituciones);

  const existeInst = instituciones.some((i) => i.id === valorInstPrevio);
  selectInstitucionCurso.value = existeInst
    ? valorInstPrevio
    : instituciones[0].id;

  renderizarSelectSedesCursos();
}

function renderizarSelectSedesCursos() {
  const institucion = obtenerInstitucionPorId(selectInstitucionCurso.value);
  if (!institucion) return;

  const sedes = institucion.sedes;

  if (sedes.length === 0) {
    cursosSinSedes.classList.remove("hidden");
    cursosPanel.classList.add("hidden");
    return;
  }

  cursosSinSedes.classList.add("hidden");
  cursosPanel.classList.remove("hidden");

  const valorSedePrevio = selectSedeCurso.value;
  selectSedeCurso.innerHTML = sedes
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map(
      (sede) =>
        `<option value="${sede.id}">${escapeHtml(sede.nombre)} (${escapeHtml(sede.codigo)})</option>`,
    )
    .join("");

  const existeSede = sedes.some((s) => s.id === valorSedePrevio);
  selectSedeCurso.value = existeSede ? valorSedePrevio : sedes[0].id;

  renderizarCursos();
}

function crearTarjetaCurso(curso, institucionId, sedeId) {
  const li = document.createElement("li");
  li.className =
    "flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3";
  li.innerHTML = `
    <div class="min-w-0 flex-1">
      <p class="font-medium text-slate-900">${escapeHtml(curso.nombre)}</p>
      <p class="mt-0.5 text-sm text-slate-500">
        ${escapeHtml(NIVEL_LABEL[curso.nivel] ?? curso.nivel)}
      </p>
      <p class="mt-1 text-xs text-slate-400">
        <span class="font-mono">${escapeHtml(curso.codigo)}</span>
        · ${curso.docentes.length} docente${curso.docentes.length === 1 ? "" : "s"}
      </p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        data-inst-id="${institucionId}"
        data-sede-id="${sedeId}"
        data-curso-id="${curso.id}"
        class="btn-gestionar-docentes text-sm font-medium text-amber-600 hover:text-amber-800"
      >
        Docentes →
      </button>
      <button
        type="button"
        data-curso-id="${curso.id}"
        data-sede-id="${sedeId}"
        data-inst-id="${institucionId}"
        class="btn-eliminar-curso text-sm text-red-600 hover:text-red-800"
      >
        Eliminar
      </button>
    </div>
  `;
  return li;
}

function renderizarCursos() {
  const seleccion = obtenerSedeSeleccionada(
    selectInstitucionCurso,
    selectSedeCurso,
  );
  if (!seleccion) return;

  const { institucion, sede } = seleccion;
  cursoSedeNombre.textContent = `${sede.nombre} · ${institucion.nombre}`;

  const cursos = sede.cursos;
  contadorCursos.textContent = String(cursos.length);
  listaCursos.innerHTML = "";

  if (cursos.length === 0) {
    listaCursos.classList.add("hidden");
    listaCursosVacia.classList.remove("hidden");
    return;
  }

  listaCursosVacia.classList.add("hidden");
  listaCursos.classList.remove("hidden");

  cursos
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .forEach((curso) => {
      const tarjeta = crearTarjetaCurso(curso, institucion.id, sede.id);
      tarjeta
        .querySelector(".btn-eliminar-curso")
        .addEventListener("click", () =>
          eliminarCurso(institucion.id, sede.id, curso.id),
        );
      tarjeta.querySelector(".btn-gestionar-docentes").addEventListener("click", (e) => {
        const { instId, sedeId, cursoId } = e.currentTarget.dataset;
        selectInstitucionDocente.value = instId;
        renderizarSelectSedesDocentes();
        selectSedeDocente.value = sedeId;
        renderizarSelectCursosDocentes();
        selectCursoDocente.value = cursoId;
        renderizarDocentes();
        irAPanel(docentesPanel);
      });
      listaCursos.appendChild(tarjeta);
    });
}

function renderizarPanelDocentes() {
  const instituciones = cargarInstituciones();

  if (instituciones.length === 0) {
    docentesSinInstituciones.classList.remove("hidden");
    docentesSinSedes.classList.add("hidden");
    docentesSinCursos.classList.add("hidden");
    docentesPanel.classList.add("hidden");
    return;
  }

  docentesSinInstituciones.classList.add("hidden");

  const valorInstPrevio = selectInstitucionDocente.value;
  selectInstitucionDocente.innerHTML = opcionesInstituciones(instituciones);

  const existeInst = instituciones.some((i) => i.id === valorInstPrevio);
  selectInstitucionDocente.value = existeInst
    ? valorInstPrevio
    : instituciones[0].id;

  renderizarSelectSedesDocentes();
}

function renderizarSelectSedesDocentes() {
  const institucion = obtenerInstitucionPorId(selectInstitucionDocente.value);
  if (!institucion) return;

  const sedes = institucion.sedes;

  if (sedes.length === 0) {
    docentesSinSedes.classList.remove("hidden");
    docentesSinCursos.classList.add("hidden");
    docentesPanel.classList.add("hidden");
    return;
  }

  docentesSinSedes.classList.add("hidden");

  const valorSedePrevio = selectSedeDocente.value;
  selectSedeDocente.innerHTML = sedes
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map(
      (sede) =>
        `<option value="${sede.id}">${escapeHtml(sede.nombre)} (${escapeHtml(sede.codigo)})</option>`,
    )
    .join("");

  const existeSede = sedes.some((s) => s.id === valorSedePrevio);
  selectSedeDocente.value = existeSede ? valorSedePrevio : sedes[0].id;

  renderizarSelectCursosDocentes();
}

function renderizarSelectCursosDocentes() {
  const seleccion = obtenerSedeSeleccionada(
    selectInstitucionDocente,
    selectSedeDocente,
  );
  if (!seleccion) return;

  const cursos = seleccion.sede.cursos;

  if (cursos.length === 0) {
    docentesSinCursos.classList.remove("hidden");
    docentesPanel.classList.add("hidden");
    return;
  }

  docentesSinCursos.classList.add("hidden");
  docentesPanel.classList.remove("hidden");

  const valorCursoPrevio = selectCursoDocente.value;
  selectCursoDocente.innerHTML = cursos
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map(
      (curso) =>
        `<option value="${curso.id}">${escapeHtml(curso.nombre)} (${escapeHtml(curso.codigo)})</option>`,
    )
    .join("");

  const existeCurso = cursos.some((c) => c.id === valorCursoPrevio);
  selectCursoDocente.value = existeCurso ? valorCursoPrevio : cursos[0].id;

  renderizarDocentes();
}

function crearTarjetaDocente(docente, institucionId, sedeId, cursoId) {
  const li = document.createElement("li");
  li.className =
    "flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3";
  li.innerHTML = `
    <div class="min-w-0 flex-1">
      <p class="font-medium text-slate-900">${escapeHtml(docente.nombre)}</p>
      <p class="mt-0.5 text-sm text-slate-500">${escapeHtml(docente.correo)}</p>
      <p class="mt-1 text-xs text-slate-400">
        <span class="font-mono">${escapeHtml(docente.codigo)}</span>
        · ${escapeHtml(docente.materia)}
      </p>
    </div>
    <button
      type="button"
      data-docente-id="${docente.id}"
      data-curso-id="${cursoId}"
      data-sede-id="${sedeId}"
      data-inst-id="${institucionId}"
      class="btn-eliminar-docente shrink-0 text-sm text-red-600 hover:text-red-800"
    >
      Eliminar
    </button>
  `;
  return li;
}

function renderizarDocentes() {
  const seleccion = obtenerCursoSeleccionado();
  if (!seleccion) return;

  const { institucion, sede, curso } = seleccion;
  docenteCursoNombre.textContent = `${curso.nombre} · ${sede.nombre}`;

  const docentes = curso.docentes;
  contadorDocentes.textContent = String(docentes.length);
  listaDocentes.innerHTML = "";

  if (docentes.length === 0) {
    listaDocentes.classList.add("hidden");
    listaDocentesVacia.classList.remove("hidden");
    return;
  }

  listaDocentesVacia.classList.add("hidden");
  listaDocentes.classList.remove("hidden");

  docentes
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .forEach((docente) => {
      const tarjeta = crearTarjetaDocente(
        docente,
        institucion.id,
        sede.id,
        curso.id,
      );
      tarjeta
        .querySelector(".btn-eliminar-docente")
        .addEventListener("click", () =>
          eliminarDocente(institucion.id, sede.id, curso.id, docente.id),
        );
      listaDocentes.appendChild(tarjeta);
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
  const sedes = instituciones[indice].sedes;

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
    cursos: [],
  };

  instituciones[indice].sedes = [nueva, ...sedes];
  guardarInstituciones(instituciones);
  return nueva;
}

function registrarCurso(institucionId, sedeId, datos) {
  const instituciones = cargarInstituciones();
  const indiceInst = instituciones.findIndex((i) => i.id === institucionId);
  if (indiceInst === -1) return false;

  const indiceSede = instituciones[indiceInst].sedes.findIndex(
    (s) => s.id === sedeId,
  );
  if (indiceSede === -1) return false;

  const codigo = normalizarCodigo(datos.codigo);
  const cursos = instituciones[indiceInst].sedes[indiceSede].cursos;

  if (cursos.some((c) => c.codigo === codigo)) {
    mostrarError(
      formCursoError,
      `Ya existe un curso con el código "${codigo}" en esta sede.`,
    );
    return false;
  }

  const nuevo = {
    id: crypto.randomUUID(),
    nombre: datos.nombre.trim(),
    codigo,
    nivel: datos.nivel,
    creadaEn: new Date().toISOString(),
    docentes: [],
  };

  instituciones[indiceInst].sedes[indiceSede].cursos = [nuevo, ...cursos];
  guardarInstituciones(instituciones);
  return nuevo;
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

function eliminarCurso(institucionId, sedeId, cursoId) {
  const instituciones = cargarInstituciones();
  const indiceInst = instituciones.findIndex((i) => i.id === institucionId);
  if (indiceInst === -1) return;

  const indiceSede = instituciones[indiceInst].sedes.findIndex(
    (s) => s.id === sedeId,
  );
  if (indiceSede === -1) return;

  const curso = instituciones[indiceInst].sedes[indiceSede].cursos.find(
    (c) => c.id === cursoId,
  );
  if (!curso) return;

  instituciones[indiceInst].sedes[indiceSede].cursos = instituciones[
    indiceInst
  ].sedes[indiceSede].cursos.filter((c) => c.id !== cursoId);

  guardarInstituciones(instituciones);
  renderizarLista();
  mostrarToast(`Curso "${curso.nombre}" eliminado.`);
}

function registrarDocente(institucionId, sedeId, cursoId, datos) {
  const instituciones = cargarInstituciones();
  const indices = encontrarCurso(instituciones, institucionId, sedeId, cursoId);
  if (!indices) return false;

  const institucion = instituciones[indices.indiceInst];
  const codigo = normalizarCodigo(datos.codigo);

  if (codigoDocenteEnInstitucion(institucion, codigo)) {
    mostrarError(
      formDocenteError,
      `Ya existe un docente con el código "${codigo}" en esta institución.`,
    );
    return false;
  }

  const docentes =
    instituciones[indices.indiceInst].sedes[indices.indiceSede].cursos[
      indices.indiceCurso
    ].docentes;

  const nuevo = {
    id: crypto.randomUUID(),
    nombre: datos.nombre.trim(),
    codigo,
    correo: datos.correo.trim().toLowerCase(),
    materia: datos.materia.trim(),
    creadaEn: new Date().toISOString(),
  };

  instituciones[indices.indiceInst].sedes[indices.indiceSede].cursos[
    indices.indiceCurso
  ].docentes = [nuevo, ...docentes];

  guardarInstituciones(instituciones);
  return nuevo;
}

function eliminarDocente(institucionId, sedeId, cursoId, docenteId) {
  const instituciones = cargarInstituciones();
  const indices = encontrarCurso(instituciones, institucionId, sedeId, cursoId);
  if (!indices) return;

  const docentes =
    instituciones[indices.indiceInst].sedes[indices.indiceSede].cursos[
      indices.indiceCurso
    ].docentes;

  const docente = docentes.find((d) => d.id === docenteId);
  if (!docente) return;

  instituciones[indices.indiceInst].sedes[indices.indiceSede].cursos[
    indices.indiceCurso
  ].docentes = docentes.filter((d) => d.id !== docenteId);

  guardarInstituciones(instituciones);
  renderizarLista();
  mostrarToast(`Docente "${docente.nombre}" eliminado.`);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  ocultarError(formError);

  const formData = new FormData(form);
  const registrada = registrarInstitucion({
    nombre: formData.get("nombre"),
    codigo: formData.get("codigo"),
    tipo: formData.get("tipo"),
    correo: formData.get("correo"),
  });

  if (!registrada) return;

  form.reset();
  renderizarLista();
  mostrarToast(`"${registrada.nombre}" registrada correctamente.`);
});

formSede.addEventListener("submit", (event) => {
  event.preventDefault();
  ocultarError(formSedeError);

  const institucion = obtenerInstitucionSeleccionadaSedes();
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

formCurso.addEventListener("submit", (event) => {
  event.preventDefault();
  ocultarError(formCursoError);

  const seleccion = obtenerSedeSeleccionada(
    selectInstitucionCurso,
    selectSedeCurso,
  );
  if (!seleccion) return;

  const formData = new FormData(formCurso);
  const registrado = registrarCurso(
    seleccion.institucion.id,
    seleccion.sede.id,
    {
      nombre: formData.get("nombre"),
      codigo: formData.get("codigo"),
      nivel: formData.get("nivel"),
    },
  );

  if (!registrado) return;

  formCurso.reset();
  renderizarLista();
  mostrarToast(`Curso "${registrado.nombre}" creado.`);
});

formDocente.addEventListener("submit", (event) => {
  event.preventDefault();
  ocultarError(formDocenteError);

  const seleccion = obtenerCursoSeleccionado();
  if (!seleccion) return;

  const formData = new FormData(formDocente);
  const registrado = registrarDocente(
    seleccion.institucion.id,
    seleccion.sede.id,
    seleccion.curso.id,
    {
      nombre: formData.get("nombre"),
      codigo: formData.get("codigo"),
      correo: formData.get("correo"),
      materia: formData.get("materia"),
    },
  );

  if (!registrado) return;

  formDocente.reset();
  renderizarLista();
  mostrarToast(`Docente "${registrado.nombre}" registrado.`);
});

selectInstitucion.addEventListener("change", renderizarSedes);
selectInstitucionCurso.addEventListener("change", renderizarSelectSedesCursos);
selectSedeCurso.addEventListener("change", renderizarCursos);
selectInstitucionDocente.addEventListener("change", renderizarSelectSedesDocentes);
selectSedeDocente.addEventListener("change", renderizarSelectCursosDocentes);
selectCursoDocente.addEventListener("change", renderizarDocentes);

renderizarLista();
