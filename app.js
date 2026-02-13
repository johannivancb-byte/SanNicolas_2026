// Aplicación de Consulta de Horarios
// IE Nuevo Compartir - San Nicolás

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const PERIODS = [1, 2, 3, 4, 5, 6];
const PERIOD_TIMES = {
    1: '6:00 - 6:55',
    2: '6:55 - 7:50',
    3: '7:50 - 8:45',
    4: '8:45 - 9:40',
    5: '10:20 - 11:10',
    6: '11:10 - 12:00'
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    populateSelects();
    setupTabs();
    setupForms();
    setupClearButton();
}

// Poblar los selectores con datos
function populateSelects() {
    // Obtener listas únicas
    const cursos = [...new Set(HORARIOS_DATA.map(c => c.course))].sort();
    const docentes = [...new Set(HORARIOS_DATA.map(c => c.teacher))].sort();
    const salones = [...new Set(HORARIOS_DATA.map(c => c.room))]
        .filter(s => s !== 'SIN ASIGNAR' && s !== 'PATIO' && s !== 'Patio')
        .sort((a, b) => {
            const aNum = parseInt(a);
            const bNum = parseInt(b);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            return a.localeCompare(b);
        });

    // Poblar select de cursos
    const selectCurso = document.getElementById('select-curso');
    const selectCursoAvanzada = document.getElementById('busqueda-curso-avanzada');
    
    cursos.forEach(curso => {
        const grado = obtenerGrado(curso);
        selectCurso.add(new Option(`${curso} (Grado ${grado}°)`, curso));
        selectCursoAvanzada.add(new Option(`${curso} (Grado ${grado}°)`, curso));
    });

    // Poblar select de profesores
    const selectProfesor = document.getElementById('select-profesor');
    docentes.forEach(docente => {
        const nombrePreferido = NOMBRES_DOCENTES[docente] || docente;
        selectProfesor.add(new Option(nombrePreferido, docente));
    });

    // Poblar select de salones
    const selectSalon = document.getElementById('select-salon');
    const selectSalonAvanzada = document.getElementById('busqueda-salon-avanzada');
    
    salones.forEach(salon => {
        selectSalon.add(new Option(salon, salon));
        selectSalonAvanzada.add(new Option(salon, salon));
    });
}

function obtenerGrado(curso) {
    if (curso.startsWith('10')) return '10';
    if (curso.startsWith('11')) return '11';
    return curso[0];
}

// Configurar tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const searchForms = document.querySelectorAll('.search-form');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Actualizar botones
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Actualizar formularios
            searchForms.forEach(form => form.classList.remove('active'));
            document.getElementById(`form-${tabName}`).classList.add('active');
            
            // Ocultar resultados
            document.getElementById('results-section').style.display = 'none';
        });
    });
}

// Configurar formularios
function setupForms() {
    // Formulario por curso
    document.getElementById('form-curso').addEventListener('submit', function(e) {
        e.preventDefault();
        const curso = document.getElementById('select-curso').value;
        if (curso) {
            mostrarHorarioCurso(curso);
        }
    });

    // Formulario por profesor
    document.getElementById('form-profesor').addEventListener('submit', function(e) {
        e.preventDefault();
        const profesor = document.getElementById('select-profesor').value;
        if (profesor) {
            mostrarHorarioProfesor(profesor);
        }
    });

    // Formulario por salón
    document.getElementById('form-salon').addEventListener('submit', function(e) {
        e.preventDefault();
        const salon = document.getElementById('select-salon').value;
        if (salon) {
            mostrarHorarioSalon(salon);
        }
    });

    // Formulario de búsqueda avanzada
    document.getElementById('form-busqueda').addEventListener('submit', function(e) {
        e.preventDefault();
        busquedaAvanzada();
    });
}

function setupClearButton() {
    document.getElementById('btn-clear').addEventListener('click', function() {
        document.getElementById('results-section').style.display = 'none';
        // Limpiar formularios
        document.querySelectorAll('.search-form').forEach(form => form.reset());
    });
}

// Mostrar horario por curso
function mostrarHorarioCurso(curso) {
    const clases = HORARIOS_DATA.filter(c => c.course === curso);
    const grado = obtenerGrado(curso);
    
    const title = `Horario - Grado ${grado}° - Curso ${curso}`;
    const table = generarTablaHorario(clases, 'curso');
    
    mostrarResultados(title, table);
}

// Mostrar horario por profesor
function mostrarHorarioProfesor(profesor) {
    const clases = HORARIOS_DATA.filter(c => c.teacher === profesor);
    const nombrePreferido = NOMBRES_DOCENTES[profesor] || profesor;
    
    const title = `Horario - ${nombrePreferido}`;
    const table = generarTablaHorario(clases, 'profesor');
    
    mostrarResultados(title, table);
}

// Mostrar horario por salón
function mostrarHorarioSalon(salon) {
    const clases = HORARIOS_DATA.filter(c => c.room === salon);
    
    const title = `Horario - Salón ${salon}`;
    const table = generarTablaHorario(clases, 'salon');
    
    mostrarResultados(title, table);
}

// Búsqueda avanzada
function busquedaAvanzada() {
    const dia = document.getElementById('busqueda-dia').value;
    const hora = document.getElementById('busqueda-hora').value;
    const curso = document.getElementById('busqueda-curso-avanzada').value;
    const salon = document.getElementById('busqueda-salon-avanzada').value;

    let resultados = HORARIOS_DATA;

    if (dia) {
        resultados = resultados.filter(c => c.day === dia);
    }
    if (hora) {
        resultados = resultados.filter(c => c.period == hora);
    }
    if (curso) {
        resultados = resultados.filter(c => c.course === curso);
    }
    if (salon) {
        resultados = resultados.filter(c => c.room === salon);
    }

    const filtros = [];
    if (dia) filtros.push(`Día: ${dia}`);
    if (hora) filtros.push(`Hora: ${hora}°`);
    if (curso) filtros.push(`Curso: ${curso}`);
    if (salon) filtros.push(`Salón: ${salon}`);

    const title = filtros.length > 0 
        ? `Resultados de búsqueda - ${filtros.join(', ')}`
        : 'Todas las clases';

    const content = generarListaResultados(resultados);
    mostrarResultados(title, content);
}

// Generar tabla de horario
function generarTablaHorario(clases, tipo) {
    let html = '<div style="overflow-x: auto;"><table class="horario-table">';
    
    // Header
    html += '<thead><tr><th>Hora</th>';
    DAYS.forEach(day => {
        html += `<th>${day}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Filas por período
    PERIODS.forEach(period => {
        html += '<tr>';
        html += `<td class="hora-cell">${period}°<br>${PERIOD_TIMES[period]}</td>`;
        
        DAYS.forEach(day => {
            const clase = clases.find(c => c.day === day && c.period === period);
            
            if (clase) {
                html += '<td>';
                html += `<div class="clase-materia">${clase.subject}</div>`;
                
                if (tipo === 'curso' || tipo === 'salon') {
                    html += `<div class="clase-docente">${clase.teacherDisplay}</div>`;
                }
                if (tipo === 'curso' || tipo === 'profesor') {
                    html += `<div class="clase-salon">${clase.room}</div>`;
                }
                if (tipo === 'salon' || tipo === 'profesor') {
                    html += `<div class="clase-docente">${clase.course}</div>`;
                }
                
                html += '</td>';
            } else {
                html += '<td class="empty-cell">-</td>';
            }
        });
        
        html += '</tr>';
        
        // Descanso después de 4° período
        if (period === 4) {
            html += '<tr class="descanso-row">';
            html += '<td colspan="6">☕ DESCANSO 9:40 - 10:20</td>';
            html += '</tr>';
        }
    });

    html += '</tbody></table></div>';
    return html;
}

// Generar lista de resultados
function generarListaResultados(resultados) {
    if (resultados.length === 0) {
        return `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">No se encontraron resultados</div>
            </div>
        `;
    }

    // Ordenar por día y hora
    resultados.sort((a, b) => {
        if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
        return a.period - b.period;
    });

    let html = '<div class="search-results-list">';
    
    resultados.forEach(clase => {
        html += '<div class="result-card">';
        html += '<div class="result-card-header">';
        html += `<div class="result-card-title">${clase.subject}</div>`;
        html += `<div class="result-card-badge">${clase.day} - ${clase.period}°</div>`;
        html += '</div>';
        html += '<div class="result-card-body">';
        html += `<div class="result-item">
                    <span class="result-label">Curso</span>
                    <span class="result-value">${clase.course}</span>
                </div>`;
        html += `<div class="result-item">
                    <span class="result-label">Profesor</span>
                    <span class="result-value">${clase.teacherDisplay}</span>
                </div>`;
        html += `<div class="result-item">
                    <span class="result-label">Salón</span>
                    <span class="result-value">${clase.room}</span>
                </div>`;
        html += `<div class="result-item">
                    <span class="result-label">Horario</span>
                    <span class="result-value">${PERIOD_TIMES[clase.period]}</span>
                </div>`;
        html += '</div>';
        html += '</div>';
    });
    
    html += '</div>';
    html += `<div style="margin-top: 24px; text-align: center; color: var(--text-secondary);">
                Total de resultados: ${resultados.length}
             </div>`;
    
    return html;
}

// Mostrar resultados
function mostrarResultados(title, content) {
    document.getElementById('results-title').textContent = title;
    document.getElementById('results-content').innerHTML = content;
    document.getElementById('results-section').style.display = 'block';
    
    // Scroll suave a resultados
    document.getElementById('results-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}
