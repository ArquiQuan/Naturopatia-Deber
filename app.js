/**
 * Naturopathy Simulator - Application Logic
 * Manages video playback events, interactive questions (accordion),
 * local storage persistence, and the visual editor mode.
 */

// Data Structure: Seed / Default Case Data
const DEFAULT_CASE_DATA = {
    title: "Lactante de 4 meses con Desnutrición Aguda",
    description: "Un vecino y su pareja acuden a consulta buscando apoyo alimentario para su familia. Tienen una bebé de 4 meses ya diagnosticada con desnutrición aguda por un médico. Adicionalmente, la madre desea planificar un nuevo embarazo en los próximos 6 meses.",
    questions: [
        {
            id: "q1",
            question: "¿Qué sugerencias podríamos darle a este vecino tomando en cuenta que ya tienen una menor de 5 años (en este caso, una lactante de 4 meses) con desnutrición aguda?",
            answers: [
                "<strong>Fomento de la Lactancia Materna Exclusiva (LME):</strong> A los 4 meses, la bebé no debe consumir sólidos ni papillas. Su sistema digestivo e inmunológico es inmaduro. La recomendación naturopática y médica principal es la lactancia materna exclusiva y a libre demanda.",
                "<strong>Nutrición e Hidratación de la Madre:</strong> Dado que la bebé depende 100% de la leche materna, debemos nutrir a la madre. Se sugieren alimentos ricos en grasas saludables (semillas, aguacate, aceite de oliva), proteínas de alta calidad y suplementación natural con hierro, ácido fólico y calcio para mejorar el perfil de la leche.",
                "<strong>Higiene en la Lactancia y Hogar:</strong> Evitar biberones o agua sin hervir (que introducen bacterias). Si se usa fórmula por indicación médica, asegurar la esterilización rigurosa del agua y utensilios para evitar diarreas infecciosas.",
                "<strong>Monitoreo Clínico:</strong> Seguir rigurosamente el tratamiento médico ya prescrito (nutrición terapéutica si aplica) y vigilar la ganancia de peso semanal."
            ]
        },
        {
            id: "q2",
            question: "¿Recomendarían a la mamá el embarazo en los próximos 6 meses?",
            answers: [
                "<strong>Recomendación:</strong> No se recomienda.",
                "<strong>Justificación:</strong> A los 6 meses, la bebé tendrá solo 10 meses y estará en plena transición de alimentación complementaria, requiriendo aún mucha leche materna. Un nuevo embarazo a los 6 meses provocará el Síndrome de Desgaste Materno. La madre necesita recuperar micronutrientes y energía. Quedar embarazada tan pronto aumentaría el riesgo de parto prematuro, bajo peso al nacer para el nuevo bebé y afectaría severamente el desarrollo de la bebé actual."
            ]
        },
        {
            id: "q3",
            question: "¿Consideran que puede influir el hecho de que la mamá esté lactando y que la bebé tenga desnutrición aguda en el próximo embarazo? ¿cómo?",
            answers: [
                "<strong>Influencia:</strong> Sí, influye de manera drástica.",
                "<strong>Agotamiento del Suministro de Leche:</strong> Las hormonas del nuevo embarazo (especialmente la progesterona) tienden a reducir significativamente la producción de leche materna y a alterar su sabor, lo que podría provocar un destete abrupto involuntario de la bebé de 10 meses, quien ya sufre desnutrición aguda y necesita esa leche.",
                "<strong>Deficiencia de Nutrientes Crítica:</strong> El cuerpo materno dará prioridad al desarrollo del nuevo feto en el útero, disminuyendo los nutrientes destinados a la leche de la lactante actual. La madre sufrirá descalcificación, anemia y desnutrición severa, lo que perjudica a los tres (madre, bebé actual y futuro feto)."
            ]
        },
        {
            id: "q4",
            question: "¿Qué otra información necesitarían obtener de la familia para poder elaborarles un plan de sugerencias?",
            answers: [
                "<strong>Técnica de Lactancia:</strong> Frecuencia de las tomas, duración, posición y si la bebé succiona de forma eficaz.",
                "<strong>Alimentación de la Madre:</strong> Registro de lo que come la madre diariamente (para corregir deficiencias nutricionales que afecten la leche).",
                "<strong>Consumo de Líquidos/Tés:</strong> Indagar si le están dando agua, tés de hierbas u otros líquidos a la bebé (lo cual es muy común y peligroso a los 4 meses, ya que reduce la toma de leche y causa infecciones).",
                "<strong>Indicaciones Médicas Previas:</strong> Qué tratamiento específico o suplementos les dejó el médico que ya visitaron.",
                "<strong>Condiciones Sanitarias:</strong> Acceso a agua potable y saneamiento en la casa."
            ]
        }
    ]
};

// Application State
let caseData = null;
let isUnlocked = false;

// DOM Elements
const elements = {
    caseVideo: document.getElementById('case-video'),
    videoStatus: document.getElementById('video-status'),
    videoOverlay: document.getElementById('video-overlay'),
    replayBtn: document.getElementById('replay-btn'),
    
    lockCard: document.getElementById('questions-lock-card'),
    questionsCard: document.getElementById('questions-card'),
    accordionContainer: document.getElementById('accordion-container'),
    bypassLockBtn: document.getElementById('bypass-lock-btn'),
    
    caseTitle: document.getElementById('case-title'),
    caseDescription: document.getElementById('case-description'),
    
    // Editor Elements
    toggleEditorBtn: document.getElementById('toggle-editor-btn'),
    closeEditorBtn: document.getElementById('close-editor-btn'),
    editorSidebar: document.getElementById('editor-sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    editorForm: document.getElementById('editor-form'),
    inputCaseTitle: document.getElementById('input-case-title'),
    inputCaseDesc: document.getElementById('input-case-desc'),
    editorQuestionsList: document.getElementById('editor-questions-list'),
    addQuestionBtn: document.getElementById('add-question-btn'),
    resetDefaultBtn: document.getElementById('reset-default-btn'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    importJsonInput: document.getElementById('import-json-input')
};

// ==========================================================================
// STATE MANAGEMENT & PERSISTENCE
// ==========================================================================

/**
 * Loads the case data from LocalStorage or falls back to defaults.
 */
function loadCaseData() {
    try {
        const stored = localStorage.getItem('naturopatia_case_data');
        if (stored) {
            caseData = JSON.parse(stored);
        } else {
            caseData = JSON.parse(JSON.stringify(DEFAULT_CASE_DATA));
        }
    } catch (e) {
        console.error("Error al cargar datos de localStorage:", e);
        caseData = JSON.parse(JSON.stringify(DEFAULT_CASE_DATA));
    }
}

/**
 * Saves the current case data to LocalStorage.
 */
function saveCaseData() {
    try {
        localStorage.setItem('naturopatia_case_data', JSON.stringify(caseData));
    } catch (e) {
        console.error("Error al guardar datos en localStorage:", e);
    }
}

// ==========================================================================
// RENDER FUNCTIONS
// ==========================================================================

/**
 * Renders the main case information and the accordion of questions.
 */
function renderCase() {
    // Render Title & Description
    elements.caseTitle.textContent = caseData.title;
    elements.caseDescription.textContent = caseData.description;
    
    // Render Accordion
    elements.accordionContainer.innerHTML = '';
    
    caseData.questions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.dataset.id = q.id;
        
        // Header
        const header = document.createElement('button');
        header.className = 'accordion-header';
        header.innerHTML = `
            <span>${index + 1}. ${q.question}</span>
            <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;
        
        // Content
        const content = document.createElement('div');
        content.className = 'accordion-content';
        
        const inner = document.createElement('div');
        inner.className = 'accordion-content-inner';
        
        const recList = document.createElement('ul');
        recList.className = 'recommendations-list';
        
        q.answers.forEach((ans, ansIdx) => {
            const li = document.createElement('li');
            li.className = 'rec-item';
            li.innerHTML = `
                <span class="rec-bullet">${ansIdx + 1}</span>
                <span class="rec-text">${ans}</span>
            `;
            recList.appendChild(li);
        });
        
        inner.appendChild(recList);
        content.appendChild(inner);
        item.appendChild(header);
        item.appendChild(content);
        
        // Accordion click handler
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.accordion-item').forEach(el => {
                el.classList.remove('active');
            });
            
            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
        
        elements.accordionContainer.appendChild(item);
    });
}

/**
 * Renders the configuration inputs in the Editor sidebar.
 */
function renderEditor() {
    elements.inputCaseTitle.value = caseData.title;
    elements.inputCaseDesc.value = caseData.description;
    
    elements.editorQuestionsList.innerHTML = '';
    
    caseData.questions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'editor-question-item';
        item.dataset.id = q.id;
        
        item.innerHTML = `
            <div class="eq-header">
                <span class="eq-number">PREGUNTA ${index + 1}</span>
                <button type="button" class="btn-remove-q" data-id="${q.id}">Eliminar</button>
            </div>
            <div class="form-group">
                <label>Pregunta</label>
                <input type="text" class="input-q-text" value="${q.question}" required>
            </div>
            <div class="form-group">
                <label>Recomendaciones (Una por línea)</label>
                <textarea class="input-q-answers" rows="4" required>${q.answers.join('\n')}</textarea>
            </div>
        `;
        
        // Remove button handler
        item.querySelector('.btn-remove-q').addEventListener('click', (e) => {
            removeQuestion(q.id);
        });
        
        elements.editorQuestionsList.appendChild(item);
    });
}

// ==========================================================================
// SIMULATOR INTERACTIONS (VIDEO & LOCKS)
// ==========================================================================

/**
 * Unlocks the questions panel.
 */
function unlockQuestions() {
    isUnlocked = true;
    elements.lockCard.classList.add('hidden-element');
    elements.questionsCard.classList.remove('hidden-element');
    
    // Smooth scroll to questions if on mobile/smaller screens
    if (window.innerWidth <= 992) {
        elements.questionsCard.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Locks the questions panel.
 */
function lockQuestions() {
    isUnlocked = false;
    elements.lockCard.classList.remove('hidden-element');
    elements.questionsCard.classList.add('hidden-element');
}

/**
 * Sets up listeners for the HTML5 Video Element.
 */
function setupVideoEvents() {
    const video = elements.caseVideo;
    
    video.addEventListener('play', () => {
        elements.videoStatus.textContent = "Reproduciendo caso...";
        elements.videoStatus.style.backgroundColor = "rgba(217, 83, 79, 0.1)";
        elements.videoStatus.style.color = "var(--danger)";
    });
    
    video.addEventListener('pause', () => {
        // Only show pause if not ended
        if (!video.ended) {
            elements.videoStatus.textContent = "En pausa";
            elements.videoStatus.style.backgroundColor = "var(--primary-light)";
            elements.videoStatus.style.color = "var(--primary)";
        }
    });
    
    video.addEventListener('ended', () => {
        elements.videoStatus.textContent = "Caso presentado";
        elements.videoStatus.style.backgroundColor = "var(--primary-light)";
        elements.videoStatus.style.color = "var(--primary)";
        
        // Show completion overlay
        elements.videoOverlay.classList.remove('hidden');
        
        // Unlock recommendation accordion
        unlockQuestions();
    });
    
    // Replay button from the overlay
    elements.replayBtn.addEventListener('click', () => {
        elements.videoOverlay.classList.add('hidden');
        video.currentTime = 0;
        video.play().catch(err => {
            console.log("Error al intentar reproducir el video:", err);
        });
    });
    
    // Bypass lock button (Demo/Review mode)
    elements.bypassLockBtn.addEventListener('click', () => {
        unlockQuestions();
        elements.videoStatus.textContent = "Modo Demo Activo";
    });
}

// ==========================================================================
// EDITOR OPERATIONS (ADD, REMOVE, SAVE, EXPORT, IMPORT)
// ==========================================================================

/**
 * Adds a new blank question to the editor state.
 */
function addQuestion() {
    const newId = 'q_' + Date.now();
    caseData.questions.push({
        id: newId,
        question: "Nueva Pregunta Guía",
        answers: [
            "Recomendación número uno.",
            "Recomendación número dos."
        ]
    });
    renderEditor();
    
    // Scroll editor body to the bottom
    const sidebarBody = document.querySelector('.sidebar-body');
    sidebarBody.scrollTop = sidebarBody.scrollHeight;
}

/**
 * Removes a question from the editor state.
 */
function removeQuestion(id) {
    if (caseData.questions.length <= 1) {
        alert("El simulador debe tener al menos una pregunta.");
        return;
    }
    caseData.questions = caseData.questions.filter(q => q.id !== id);
    renderEditor();
}

/**
 * Saves modifications from the Editor Form back into application state.
 */
function saveEditorChanges(e) {
    e.preventDefault();
    
    // Update Title & Description
    caseData.title = elements.inputCaseTitle.value;
    caseData.description = elements.inputCaseDesc.value;
    
    // Update Questions & Answers
    const questionItems = elements.editorQuestionsList.querySelectorAll('.editor-question-item');
    const updatedQuestions = [];
    
    questionItems.forEach(item => {
        const id = item.dataset.id;
        const questionText = item.querySelector('.input-q-text').value;
        const rawAnswers = item.querySelector('.input-q-answers').value;
        
        // Split text by lines, clean whitespaces, filter out empty lines
        const answersList = rawAnswers.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
            
        updatedQuestions.push({
            id: id,
            question: questionText,
            answers: answersList
        });
    });
    
    caseData.questions = updatedQuestions;
    
    // Save, Render, and Close
    saveCaseData();
    renderCase();
    closeEditor();
}

/**
 * Restores initial seed data.
 */
function resetToDefault() {
    if (confirm("¿Estás seguro de que deseas restablecer el caso original? Se perderán todas tus personalizaciones.")) {
        caseData = JSON.parse(JSON.stringify(DEFAULT_CASE_DATA));
        saveCaseData();
        renderCase();
        renderEditor();
        closeEditor();
    }
}

/**
 * Exports current configuration to a JSON file.
 */
function exportCaseJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(caseData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    
    // Safe slugified title
    const filename = caseData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-caso.json';
        
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

/**
 * Imports configuration from a user-provided JSON file.
 */
function importCaseJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const importedData = JSON.parse(evt.target.result);
            
            // Validation
            if (importedData.title && importedData.description && Array.isArray(importedData.questions)) {
                caseData = importedData;
                saveCaseData();
                renderCase();
                renderEditor();
                closeEditor();
                alert("¡Caso clínico importado exitosamente!");
            } else {
                alert("Error: El archivo JSON no tiene la estructura válida del simulador.");
            }
        } catch (err) {
            alert("Error al leer el archivo JSON: Formato inválido.");
            console.error(err);
        }
    };
    reader.readAsText(file);
    
    // Reset file input value so same file can be uploaded again
    e.target.value = '';
}

// ==========================================================================
// SIDEBAR TOGGLERS
// ==========================================================================

function openEditor() {
    renderEditor();
    elements.editorSidebar.classList.add('open');
    elements.sidebarOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
}

function closeEditor() {
    elements.editorSidebar.classList.remove('open');
    elements.sidebarOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================

function init() {
    // Load local storage or default data
    loadCaseData();
    
    // Render initial structures
    renderCase();
    
    // Set up Video player events
    setupVideoEvents();
    
    // Register Editor Toggles
    elements.toggleEditorBtn.addEventListener('click', openEditor);
    elements.closeEditorBtn.addEventListener('click', closeEditor);
    elements.sidebarOverlay.addEventListener('click', closeEditor);
    
    // Register Editor Form operations
    elements.addQuestionBtn.addEventListener('click', addQuestion);
    elements.editorForm.addEventListener('submit', saveEditorChanges);
    elements.resetDefaultBtn.addEventListener('click', resetToDefault);
    
    // Register Backup Operations
    elements.exportJsonBtn.addEventListener('click', exportCaseJSON);
    elements.importJsonInput.addEventListener('change', importCaseJSON);
}

// Run app
document.addEventListener('DOMContentLoaded', init);
