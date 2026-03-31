// Horarios IENC — San Nicolás
// app.js — Lógica de filtros

const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const PERIODS = [1,2,3,4,5,6];
const PERIOD_LABELS = {
  1:'1° 6:00-6:55', 2:'2° 6:55-7:50', 3:'3° 7:50-8:45',
  4:'4° 8:45-9:40', 5:'5° 10:20-11:10', 6:'6° 11:10-12:00'
};
const PERIOD_KEYS = {
  1:'1° 6:00 - 6:55', 2:'2° 6:55 - 7:50', 3:'3° 7:50 - 8:45',
  4:'4° 8:45 - 9:40', 5:'5° 10:20 - 11:10', 6:'6° 11:10 - 12:00'
};

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  populateSelects();
  setupListeners();
  renderReuniones();
  renderAtencion();
  renderSalonesBase();
});

// ── Tabs ──
function setupTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
    });
  });
}

// ── Populate selects ──
function populateSelects() {
  const docentes = [...new Set(HORARIOS_DATA.map(r => r.teacher))].sort();
  const cursos = [...new Set(HORARIOS_DATA.filter(r => r.course !== 'ADMIN').map(r => r.course))].sort((a,b) => parseInt(a)-parseInt(b));
  const salones = [...new Set(HORARIOS_DATA.filter(r => r.room && !r.room.includes('Sala de profesores')).map(r => r.room))].sort((a,b) => {
    const na = parseInt(a), nb = parseInt(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

  const selDoc = document.getElementById('select-docente');
  docentes.forEach(d => {
    const display = NOMBRES_DOCENTES[d] || d;
    selDoc.add(new Option(display, d));
  });

  const selCur = document.getElementById('select-curso');
  cursos.forEach(c => selCur.add(new Option(c, c)));

  const selSal = document.getElementById('select-salon');
  salones.forEach(s => selSal.add(new Option(s, s)));
}

// ── Event listeners ──
function setupListeners() {
  document.getElementById('select-docente').addEventListener('change', e => {
    if (e.target.value) renderDocente(e.target.value);
  });
  document.getElementById('select-curso').addEventListener('change', e => {
    if (e.target.value) renderCurso(e.target.value);
  });
  document.getElementById('select-salon').addEventListener('change', e => {
    if (e.target.value) renderSalon(e.target.value);
  });
  document.getElementById('select-disp-dia').addEventListener('change', tryDisponibilidad);
  document.getElementById('select-disp-hora').addEventListener('change', tryDisponibilidad);
}

// ════════════════════════════════════════
// FILTRO 1: Por docente
// ════════════════════════════════════════
function renderDocente(teacher) {
  const records = [...HORARIOS_DATA.filter(r => r.teacher === teacher)];
  // Inject atención a acudientes from ATENCION_ACUDIENTES
  DAYS.forEach(day => {
    PERIODS.forEach(p => {
      const list = (ATENCION_ACUDIENTES[day] && ATENCION_ACUDIENTES[day][p]) || [];
      if (list.some(t => t.docente === teacher)) {
        records.push({ teacher, day, period: p, course: 'ADMIN', subject: 'Atención a acudientes', room: 'Sala de profesores' });
      }
    });
  });
  const display = NOMBRES_DOCENTES[teacher] || teacher;
  const grid = buildGrid(records, (r) => {
    if (r.course === 'ADMIN') return cellAdmin(r.subject);
    return cellClass(r.subject, r.course, 'S.' + r.room);
  });
  document.getElementById('result-docente').innerHTML =
    `<h3 class="grid-title">${display}</h3>` + grid;
}

// ════════════════════════════════════════
// FILTRO 2: Por curso
// ════════════════════════════════════════
function renderCurso(course) {
  const records = HORARIOS_DATA.filter(r => r.course === course);
  const grid = buildGrid(records, (r) => {
    const dn = NOMBRES_DOCENTES[r.teacher] || r.teacher;
    return cellClass(r.subject, dn, 'S.' + r.room);
  });
  document.getElementById('result-curso').innerHTML =
    `<h3 class="grid-title">Curso ${course}</h3>` + grid;
}

// ════════════════════════════════════════
// FILTRO 3: Por salón
// ════════════════════════════════════════
function renderSalon(room) {
  const records = HORARIOS_DATA.filter(r => r.room === room && r.course !== 'ADMIN');
  const grid = buildGrid(records, (r) => {
    const dn = NOMBRES_DOCENTES[r.teacher] || r.teacher;
    return cellClass(r.subject, r.course, dn);
  });
  document.getElementById('result-salon').innerHTML =
    `<h3 class="grid-title">Salón ${room}</h3>` + grid;
}

// ════════════════════════════════════════
// FILTRO 4: Reuniones de área
// ════════════════════════════════════════
function renderReuniones() {
  const byDay = {};
  REUNIONES_AREA.forEach(r => {
    if (!byDay[r.dia]) byDay[r.dia] = [];
    byDay[r.dia].push(r);
  });
  let html = '<div class="info-table"><table>';
  html += '<tr><th>Docente</th><th>Día</th><th>Hora</th></tr>';
  DAYS.forEach(day => {
    (byDay[day] || []).sort((a,b) => a.docenteDisplay.localeCompare(b.docenteDisplay)).forEach(r => {
      html += `<tr><td>${r.docenteDisplay}</td><td>${r.dia}</td><td>6° 11:10-12:00</td></tr>`;
    });
  });
  html += '</table></div>';
  document.getElementById('result-reuniones').innerHTML = html;
}

// ════════════════════════════════════════
// FILTRO 5: Atención a acudientes
// ════════════════════════════════════════
function renderAtencion() {
  let html = '<div class="schedule-grid"><table>';
  html += '<tr><th class="hour-col">Hora</th>';
  DAYS.forEach(d => { html += `<th>${d}</th>`; });
  html += '</tr>';

  PERIODS.forEach(p => {
    html += `<tr><td class="hour-col" style="text-align:right;font-weight:600;font-size:11px;color:var(--gray-500)">${PERIOD_LABELS[p]}</td>`;
    DAYS.forEach(day => {
      const teachers = (ATENCION_ACUDIENTES[day] && ATENCION_ACUDIENTES[day][p]) || [];
      if (teachers.length > 0) {
        html += '<td class="cell-class" style="vertical-align:top;padding:2px 4px">';
        teachers.forEach(t => {
          html += `<span class="cell-teacher-row">${t.docenteDisplay}</span>`;
        });
        html += '</td>';
      } else {
        html += '<td class="cell-free">—</td>';
      }
    });
    html += '</tr>';
  });
  html += '</table></div>';
  document.getElementById('result-atencion').innerHTML = html;
}

// ════════════════════════════════════════
// FILTRO 6: Salones base
// ════════════════════════════════════════
function renderSalonesBase() {
  const entries = Object.entries(SALONES_BASE).sort((a,b) =>
    a[1].docenteDisplay.localeCompare(b[1].docenteDisplay));

  let html = '<div class="info-table"><table>';
  html += '<tr><th>Docente</th><th>Tipo</th><th>Salón</th></tr>';
  entries.forEach(([full, info]) => {
    const tipo = info.tipo === 'fijo'
      ? '<span style="color:var(--blue);font-weight:600">Fijo</span>'
      : '<span style="color:var(--amber);font-weight:600">Flotante</span>';
    html += `<tr><td>${info.docenteDisplay}</td><td>${tipo}</td><td>${info.salon}</td></tr>`;
  });
  html += '</table></div>';
  document.getElementById('result-salones-base').innerHTML = html;
}

// ════════════════════════════════════════
// FILTRO 7: Disponibilidad por hora
// ════════════════════════════════════════
function tryDisponibilidad() {
  const day = document.getElementById('select-disp-dia').value;
  const period = parseInt(document.getElementById('select-disp-hora').value);
  if (!day || !period) return;
  renderDisponibilidad(day, period);
}

function renderDisponibilidad(day, period) {
  // Get all teachers
  const allTeachers = [...new Set(HORARIOS_DATA.map(r => r.teacher))].sort();

  // Find who has CLASS in that slot
  const busy = {};
  HORARIOS_DATA.filter(r => r.day === day && r.period === period && r.course !== 'ADMIN')
    .forEach(r => {
      busy[r.teacher] = r;
    });

  let htmlLibres = '';
  let htmlOcupados = '';
  let countLibres = 0;
  let countOcupados = 0;

  allTeachers.forEach(t => {
    const display = NOMBRES_DOCENTES[t] || t;
    if (busy[t]) {
      countOcupados++;
      const r = busy[t];
      htmlOcupados += `<div class="disp-card ocupado">
        <div class="disp-name">${display}</div>
        <div class="disp-detail">${r.subject} · ${r.course} · S.${r.room}</div>
        <span class="disp-badge clase">En clase</span>
      </div>`;
    } else {
      countLibres++;
      // Check if has admin activity
      const admin = HORARIOS_DATA.find(r => r.teacher === t && r.day === day && r.period === period && r.course === 'ADMIN');
      let detail = 'Sin actividad asignada';
      if (admin) detail = admin.subject + ' (disponible para reemplazo)';
      htmlLibres += `<div class="disp-card">
        <div class="disp-name">${display}</div>
        <div class="disp-detail">${detail}</div>
        <span class="disp-badge libre">Disponible</span>
      </div>`;
    }
  });

  const html = `<h3 class="grid-title">${day} — ${PERIOD_LABELS[period]}</h3>
    <p style="font-size:13px;color:var(--gray-500);margin-bottom:12px">
      <strong style="color:var(--green)">${countLibres} disponibles</strong> · ${countOcupados} en clase
    </p>
    <div class="disp-grid">${htmlLibres}${htmlOcupados}</div>`;

  document.getElementById('result-disponibilidad').innerHTML = html;
}

// ════════════════════════════════════════
// Helpers
// ════════════════════════════════════════

function buildGrid(records, cellRenderer) {
  // Build lookup: (day, period) -> record
  const lookup = {};
  records.forEach(r => {
    lookup[r.day + '-' + r.period] = r;
  });

  let html = '<div class="schedule-grid"><table>';
  html += '<tr><th class="hour-col">Hora</th>';
  DAYS.forEach(d => { html += `<th>${d}</th>`; });
  html += '</tr>';

  PERIODS.forEach((p, i) => {
    // Insert descanso row after period 4
    if (p === 5) {
      html += '<tr class="descanso"><td style="text-align:right;padding-right:8px">9:40</td>';
      html += `<td colspan="5">Descanso 9:40 – 10:20</td></tr>`;
    }

    html += `<tr><td class="hour-col" style="text-align:right;font-weight:600;font-size:11px;color:var(--gray-500)">${PERIOD_LABELS[p]}</td>`;
    DAYS.forEach(day => {
      const key = day + '-' + p;
      const r = lookup[key];
      if (r) {
        const cls = r.course === 'ADMIN' ? 'cell-admin' : 'cell-class';
        html += `<td class="${cls}">${cellRenderer(r)}</td>`;
      } else {
        html += '<td class="cell-free">—</td>';
      }
    });
    html += '</tr>';
  });

  html += '</table></div>';
  return html;
}

function cellClass(materia, line2, line3) {
  return `<span class="cell-materia">${materia}</span>
          <span class="cell-detail">${line2}</span>
          <span class="cell-salon">${line3}</span>`;
}

function cellAdmin(subject) {
  return `<span class="cell-materia" style="color:var(--amber)">${subject}</span>`;
}
