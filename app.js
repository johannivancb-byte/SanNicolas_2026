/* Horarios IENC — San Nicolás · app.js */

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const HORAS = ['1° 6:00 - 6:55','2° 6:55 - 7:50','3° 7:50 - 8:45','4° 8:45 - 9:40','Descanso 9:40 - 10:20','5° 10:20 - 11:10','6° 11:10 - 12:00'];
const HORAS_CLASE = HORAS.filter(h => !h.startsWith('Descanso'));
const CURSOS = ['605','606','607','608','705','706','707','805','806','807','905','906','907','1005','1006','1105','1106'];
const GRADE_MAP = {6:['605','606','607','608'],7:['705','706','707'],8:['805','806','807'],9:['905','906','907'],10:['1005','1006'],11:['1105','1106']};

let currentTab = 'docente';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      render();
    });
  });
  render();
});

function render() {
  const c = document.getElementById('content');
  switch(currentTab) {
    case 'docente': renderDocente(c); break;
    case 'curso': renderCurso(c); break;
    case 'salon': renderSalon(c); break;
    case 'reuniones': renderReuniones(c); break;
    case 'atencion': renderAtencion(c); break;
    case 'salones-base': renderSalonesBase(c); break;
    case 'disponibilidad': renderDisponibilidad(c); break;
    case 'general': renderGeneral(c); break;
  }
}

/* === Helpers === */
function buildGrid(records, rowLabel, cellFn) {
  let html = '<div class="grid-wrap"><table><thead><tr><th>' + rowLabel + '</th>';
  DIAS.forEach(d => html += '<th>' + d + '</th>');
  html += '</tr></thead><tbody>';
  HORAS.forEach(h => {
    const isDesc = h.startsWith('Descanso');
    html += '<tr><th>' + h.split(' ')[0] + '</th>';
    DIAS.forEach(d => {
      const matches = records.filter(r => r.dia === d && r.hora === h);
      if (isDesc) {
        html += '<td class="cell-free" style="background:#eee">—</td>';
      } else if (matches.length === 0) {
        html += '<td class="cell-free">—</td>';
      } else {
        const r = matches[0];
        const cls = r.tipo === 'Administrativo' ? 'cell-admin' : 'cell-class';
        html += '<td class="' + cls + '">' + cellFn(r) + '</td>';
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function cellDocente(r) {
  if (r.tipo === 'Administrativo') return '<span class="cell-materia" style="color:var(--amber)">' + r.materia + '</span>';
  return '<span class="cell-materia">' + r.materia + '</span><span class="cell-detail">' + r.curso + '</span><span class="cell-salon">Salón ' + r.salon + '</span>';
}

function cellCurso(r) {
  if (r.tipo === 'Administrativo') return '<span class="cell-materia" style="color:var(--amber)">' + r.materia + '</span>';
  return '<span class="cell-materia">' + r.materia + '</span><span class="cell-detail">' + r.docente + '</span><span class="cell-salon">Salón ' + r.salon + '</span>';
}

function cellSalon(r) {
  if (r.tipo === 'Administrativo') return '<span class="cell-materia" style="color:var(--amber)">' + r.materia + '</span>';
  return '<span class="cell-materia">' + r.materia + '</span><span class="cell-detail">' + r.curso + '</span><span class="cell-detail">' + r.docente + '</span>';
}

/* === Tab 1: Docente === */
function renderDocente(c) {
  const opts = NOMBRES_DOCENTES.map(n => '<option value="' + n + '">' + n + '</option>').join('');
  c.innerHTML = '<div class="filter-bar"><label>Docente:</label><select id="selDocente"><option value="">— Seleccionar —</option>' + opts + '</select></div><div id="gridDocente"></div>';
  document.getElementById('selDocente').addEventListener('change', e => {
    const name = e.target.value;
    if (!name) { document.getElementById('gridDocente').innerHTML = ''; return; }
    const recs = HORARIOS_DATA.filter(r => r.docente === name);
    // Add atención
    const atRecs = ATENCION_ACUDIENTES.filter(a => a.docente === name);
    let extra = '';
    if (atRecs.length > 0) {
      extra = '<div style="margin-top:12px;padding:10px;background:#ECFDF5;border-radius:8px;border:1px solid #A7F3D0"><strong style="color:var(--green);font-size:13px">Atención a acudientes:</strong>';
      atRecs.forEach(a => extra += '<div style="font-size:12px;margin-top:4px">' + a.dia + ' — ' + a.hora.split(' ')[0] + '</div>');
      extra += '</div>';
    }
    document.getElementById('gridDocente').innerHTML = buildGrid(recs, 'Hora', cellDocente) + extra;
  });
}

/* === Tab 2: Curso === */
function renderCurso(c) {
  const opts = CURSOS.map(cu => '<option value="' + cu + '">' + cu + '</option>').join('');
  c.innerHTML = '<div class="filter-bar"><label>Curso:</label><select id="selCurso"><option value="">— Seleccionar —</option>' + opts + '</select></div><div id="gridCurso"></div>';
  document.getElementById('selCurso').addEventListener('change', e => {
    const cu = e.target.value;
    if (!cu) { document.getElementById('gridCurso').innerHTML = ''; return; }
    const recs = HORARIOS_DATA.filter(r => r.curso === cu);
    document.getElementById('gridCurso').innerHTML = buildGrid(recs, 'Hora', cellCurso);
  });
}

/* === Tab 3: Salón === */
function renderSalon(c) {
  const salones = [...new Set(HORARIOS_DATA.filter(r => r.salon && !r.salon.startsWith('Sala')).map(r => r.salon))].sort((a,b) => {
    const na = parseInt(a), nb = parseInt(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
  const opts = salones.map(s => '<option value="' + s + '">' + s + '</option>').join('');
  c.innerHTML = '<div class="filter-bar"><label>Salón:</label><select id="selSalon"><option value="">— Seleccionar —</option>' + opts + '</select></div><div id="gridSalon"></div>';
  document.getElementById('selSalon').addEventListener('change', e => {
    const s = e.target.value;
    if (!s) { document.getElementById('gridSalon').innerHTML = ''; return; }
    const recs = HORARIOS_DATA.filter(r => r.salon === s);
    document.getElementById('gridSalon').innerHTML = buildGrid(recs, 'Hora', cellSalon);
  });
}

/* === Tab 4: Reuniones === */
function renderReuniones(c) {
  let html = '<table class="simple-table"><thead><tr><th>Docente</th><th>Actividad</th><th>Día</th><th>Hora</th></tr></thead><tbody>';
  REUNIONES_AREA.forEach(r => {
    html += '<tr><td>' + r.docente + '</td><td>' + r.actividad + '</td><td>' + r.dia + '</td><td>' + r.hora.split(' ')[0] + '</td></tr>';
  });
  html += '</tbody></table>';
  c.innerHTML = html;
}

/* === Tab 5: Atención a acudientes === */
function renderAtencion(c) {
  let html = '<div class="grid-wrap"><table><thead><tr><th>Hora</th>';
  DIAS.forEach(d => html += '<th>' + d + '</th>');
  html += '</tr></thead><tbody>';
  HORAS_CLASE.forEach(h => {
    html += '<tr><th>' + h.split(' ')[0] + '</th>';
    DIAS.forEach(d => {
      const matches = ATENCION_ACUDIENTES.filter(a => a.dia === d && a.hora === h);
      if (matches.length === 0) {
        html += '<td class="cell-free">—</td>';
      } else {
        html += '<td class="atencion-cell">';
        matches.forEach(m => html += '<div class="docente-item">' + m.docente + '</div>');
        html += '</td>';
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  c.innerHTML = html;
}

/* === Tab 6: Salones base === */
function renderSalonesBase(c) {
  let html = '<table class="simple-table"><thead><tr><th>Docente</th><th>Tipo</th><th>Salón</th></tr></thead><tbody>';
  SALONES_BASE.forEach(s => {
    const badge = s.tipo === 'Fijo' ? '<span style="color:var(--green);font-weight:600">Fijo</span>' : '<span style="color:var(--amber);font-weight:600">Flotante</span>';
    html += '<tr><td>' + s.docente + '</td><td>' + badge + '</td><td>' + s.salon + '</td></tr>';
  });
  html += '</tbody></table>';
  c.innerHTML = html;
}

/* === Tab 7: Disponibilidad === */
function renderDisponibilidad(c) {
  const dOpts = DIAS.map(d => '<option value="' + d + '">' + d + '</option>').join('');
  const hOpts = HORAS_CLASE.map(h => '<option value="' + h + '">' + h.split(' ')[0] + '</option>').join('');
  c.innerHTML = '<div class="filter-bar"><label>Día:</label><select id="selDispDia">' + dOpts + '</select><label>Hora:</label><select id="selDispHora">' + hOpts + '</select></div><div id="dispoResult"></div>';
  const update = () => {
    const dia = document.getElementById('selDispDia').value;
    const hora = document.getElementById('selDispHora').value;
    let html = '<div class="dispo-grid">';
    NOMBRES_DOCENTES.forEach(name => {
      const recs = HORARIOS_DATA.filter(r => r.docente === name && r.dia === dia && r.hora === hora);
      if (recs.length === 0) {
        html += '<div class="dispo-card libre"><div class="nombre">' + name + '</div><span class="badge">Libre</span></div>';
      } else {
        const r = recs[0];
        const isAdmin = r.tipo === 'Administrativo';
        if (isAdmin) {
          html += '<div class="dispo-card libre"><div class="nombre">' + name + '</div><span class="badge">Disponible</span><div class="info">' + r.materia + ' (admin)</div></div>';
        } else {
          html += '<div class="dispo-card ocupado"><div class="nombre">' + name + '</div><span class="badge">Ocupado</span><div class="info">' + r.materia + ' · ' + r.curso + '</div></div>';
        }
      }
    });
    html += '</div>';
    document.getElementById('dispoResult').innerHTML = html;
  };
  document.getElementById('selDispDia').addEventListener('change', update);
  document.getElementById('selDispHora').addEventListener('change', update);
  update();
}

/* === Tab 8: Horario General === */
let gShowFree = false;

function renderGeneral(c) {
  const subjects = new Set();
  HORARIO_GENERAL.forEach(([name, cells]) => {
    cells.forEach(cl => { if(cl[2]==='c' && cl[4] && cl[6]==='Clase') subjects.add(cl[4]); });
  });
  const subjOpts = [...subjects].sort((a,b)=>a.localeCompare(b,'es')).map(s=>'<option value="'+s+'">'+s+'</option>').join('');

  c.innerHTML = `
    <div class="general-filters">
      <div class="gf-group"><label>Día</label><select id="gfDay"><option value="all">Todos</option><option value="0">Lunes</option><option value="1">Martes</option><option value="2">Miércoles</option><option value="3">Jueves</option><option value="4">Viernes</option></select></div>
      <div class="gf-group"><label>Grado</label><select id="gfGrade"><option value="all">Todos</option><option value="6">6° Sexto</option><option value="7">7° Séptimo</option><option value="8">8° Octavo</option><option value="9">9° Noveno</option><option value="10">10° Décimo</option><option value="11">11° Undécimo</option></select></div>
      <div class="gf-group"><label>Asignatura</label><select id="gfSubject"><option value="all">Todas</option>${subjOpts}</select></div>
      <div class="gf-group"><label>Buscar curso</label><input type="text" id="gfCourse" placeholder="Ej: 905"></div>
      <div class="gf-group"><label>Buscar docente</label><input type="text" id="gfTeacher" placeholder="Ej: Janneth"></div>
      <div class="gf-group" style="align-self:flex-end"><button class="btn-gf btn-free-toggle" id="gfBtnFree">Horas libres</button></div>
      <div class="gf-group" style="align-self:flex-end"><button class="btn-gf btn-clear" id="gfBtnClear">Limpiar</button></div>
    </div>
    <div class="general-stats" id="gStats"></div>
    <div class="general-wrap" id="gWrap"></div>`;

  buildGeneralTable();
  applyGeneralFilters();

  ['gfDay','gfGrade','gfSubject'].forEach(id => document.getElementById(id).addEventListener('change', applyGeneralFilters));
  ['gfCourse','gfTeacher'].forEach(id => document.getElementById(id).addEventListener('input', applyGeneralFilters));
  document.getElementById('gfBtnFree').addEventListener('click', () => {
    gShowFree = !gShowFree;
    document.getElementById('gfBtnFree').classList.toggle('active', gShowFree);
    applyGeneralFilters();
  });
  document.getElementById('gfBtnClear').addEventListener('click', () => {
    ['gfDay','gfGrade','gfSubject'].forEach(id => document.getElementById(id).value = 'all');
    ['gfCourse','gfTeacher'].forEach(id => document.getElementById(id).value = '');
    gShowFree = false;
    document.getElementById('gfBtnFree').classList.remove('active');
    applyGeneralFilters();
  });
}

function buildGeneralTable() {
  const wrap = document.getElementById('gWrap');
  const daysLbl = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
  const hoursLbl = ['1°','2°','3°','4°','Desc.','5°','6°'];

  let html = '<table><thead><tr><th class="tc" rowspan="2">Docente</th>';
  daysLbl.forEach((d,di) => html += '<th colspan="7" data-day="'+di+'">'+d+'</th>');
  html += '</tr><tr>';
  for(let di=0;di<5;di++) hoursLbl.forEach((h,hi) => html += '<th data-day="'+di+'" data-hour="'+hi+'">'+h+'</th>');
  html += '</tr></thead><tbody>';

  HORARIO_GENERAL.forEach(([name, cells]) => {
    html += '<tr data-teacher="'+name.toLowerCase()+'">';
    html += '<td class="gtc">'+name+'</td>';
    const cm = {};
    cells.forEach(cl => cm[cl[0]+','+cl[1]] = cl);
    for(let di=0;di<5;di++) {
      for(let hi=0;hi<7;hi++) {
        const cl = cm[di+','+hi];
        if(!cl || cl[2]==='e') {
          html += '<td class="gc-empty" data-day="'+di+'" data-hour="'+hi+'" data-type="empty">—</td>';
        } else if(cl[2]==='x') {
          html += '<td class="gc-na" data-day="'+di+'" data-hour="'+hi+'" data-type="na">-x-</td>';
        } else {
          const co=cl[3],su=cl[4],ro=cl[5],ta=cl[6];
          if(ta==='Administrativo') {
            html += '<td class="gc-admin" data-day="'+di+'" data-hour="'+hi+'" data-type="admin" data-course="'+co+'" data-subject="'+su+'"><div class="gc-su">'+su+'</div></td>';
          } else {
            html += '<td class="gc-class" data-day="'+di+'" data-hour="'+hi+'" data-type="class" data-course="'+co+'" data-subject="'+su+'"><div class="gc-co">'+co+'</div><div class="gc-su">'+su+'</div><div class="gc-ro">'+ro+'</div></td>';
          }
        }
      }
    }
    html += '</tr>';
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

function applyGeneralFilters() {
  const fDay = document.getElementById('gfDay').value;
  const fGrade = document.getElementById('gfGrade').value;
  const fSubject = document.getElementById('gfSubject').value;
  const fCourse = document.getElementById('gfCourse').value.trim().toLowerCase();
  const fTeacher = document.getElementById('gfTeacher').value.trim().toLowerCase();
  const gradeCourses = fGrade !== 'all' ? GRADE_MAP[parseInt(fGrade)] : null;

  document.querySelectorAll('.general-wrap thead th[data-day]').forEach(th => {
    th.classList.toggle('hidden', fDay !== 'all' && th.dataset.day !== fDay);
  });

  let visT = 0, hlC = 0;
  document.querySelectorAll('.general-wrap tbody tr').forEach(tr => {
    if(fTeacher && !tr.dataset.teacher.includes(fTeacher)) { tr.classList.add('hidden'); return; }
    tr.classList.remove('hidden');
    visT++;
    tr.querySelectorAll('td:not(.gtc)').forEach(td => {
      const di = td.dataset.day, type = td.dataset.type;
      if(fDay !== 'all' && di !== fDay) { td.classList.add('hidden'); return; }
      td.classList.remove('hidden');
      td.classList.remove('gc-hl','gc-hl-free');
      if(gShowFree && (type==='empty'||type==='admin')) { td.classList.add('gc-hl-free'); hlC++; }
      if(gradeCourses && type==='class' && gradeCourses.includes(td.dataset.course)) { td.classList.add('gc-hl'); hlC++; }
      if(fSubject!=='all' && type==='class' && td.dataset.subject===fSubject) { td.classList.add('gc-hl'); hlC++; }
      if(fCourse && type==='class' && td.dataset.course && td.dataset.course.toLowerCase().includes(fCourse)) { td.classList.add('gc-hl'); hlC++; }
    });
  });

  const parts = [visT+' docentes'];
  if(hlC>0) parts.push(hlC+' celdas resaltadas');
  if(gShowFree) parts.push('Mostrando horas libres');
  document.getElementById('gStats').textContent = parts.join(' · ');
}
