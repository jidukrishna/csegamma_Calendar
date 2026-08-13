/**
 * CSE Gamma — Minimalist Dark Neko Class Calendar Engine 🐾
 * Features: Native Graphical Date Picker Popup, DD/MM/YYYY Formatting, Theme Animations, Date Pre-fill, Neko Petting & Custom Quests
 */

// Application State
const state = {
  events: [],
  customEvents: [],
  datedEvents: [],
  undatedEvents: [],
  eventsByDate: new Map(),
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  selectedSubject: 'ALL',
  selectedType: 'ALL',
  searchQuery: '',
  activeView: 'grid', // 'grid' or 'list'
  selectedDateStr: null,
  activeAccent: 'cyan',
  isLoading: true,
  error: null
};

// Accent Palettes Map
const ACCENT_PALETTES = {
  cyan: { primary: '#58A6FF', bg: 'rgba(88, 166, 255, 0.14)' },
  crimson: { primary: '#E63946', bg: 'rgba(230, 57, 70, 0.16)' },
  purple: { primary: '#A855F7', bg: 'rgba(168, 85, 247, 0.16)' },
  emerald: { primary: '#10B981', bg: 'rgba(16, 185, 129, 0.16)' }
};

// Month Names
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// DOM References
const elements = {
  currentMonthDisplay: document.getElementById('current-month-display'),
  calendarGrid: document.getElementById('calendar-grid'),
  agendaWrapper: document.getElementById('agenda-wrapper'),
  undatedGrid: document.getElementById('undated-grid'),
  undatedSection: document.getElementById('undated-section'),
  subjectFilterGroup: document.getElementById('subject-filter-group'),
  typeFilterGroup: document.getElementById('type-filter-group'),
  searchInput: document.getElementById('search-input'),
  prevMonthBtn: document.getElementById('prev-month-btn'),
  nextMonthBtn: document.getElementById('next-month-btn'),
  todayBtn: document.getElementById('today-btn'),
  viewToggleBtn: document.getElementById('view-toggle-btn'),
  exportIcsBtn: document.getElementById('export-ics-btn'),
  addQuestBtn: document.getElementById('add-quest-btn'),
  modalAddQuestBtn: document.getElementById('modal-add-quest-btn'),
  dayModal: document.getElementById('day-modal'),
  modalDateTitle: document.getElementById('modal-date-title'),
  modalEventCount: document.getElementById('modal-event-count'),
  modalEventsList: document.getElementById('modal-events-list'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  addQuestModal: document.getElementById('add-quest-modal'),
  addQuestForm: document.getElementById('add-quest-form'),
  questDateInput: document.getElementById('quest-date'),
  addModalCloseBtn: document.getElementById('add-modal-close-btn'),
  addModalCancelBtn: document.getElementById('add-modal-cancel-btn'),
  nekoRoofCat: document.getElementById('neko-roof-cat'),
  roofCatBubble: document.getElementById('roof-cat-bubble'),
  nekoPeekingSearch: document.getElementById('neko-peeking-search'),
  nekoSleepingCalendar: document.getElementById('neko-sleeping-calendar'),
  calendarCatBubble: document.getElementById('calendar-cat-bubble'),
  errorBanner: document.getElementById('error-banner'),
  errorMessage: document.getElementById('error-message'),
  retryBtn: document.getElementById('retry-btn'),
  statTotalEvents: document.getElementById('stat-total-events'),
  statTotalExams: document.getElementById('stat-total-exams'),
  statTotalAssignments: document.getElementById('stat-total-assignments'),
  statTotalUndated: document.getElementById('stat-total-undated')
};

// Date Formatting Helper: YYYY-MM-DD -> DD/MM/YYYY for UI text display
function formatDateDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

// Format Date YYYY-MM-DD -> Long Day, DD/MM/YYYY
function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDDMM = formatDateDDMMYYYY(dateStr);
  return `${weekday}, ${formattedDDMM}`;
}

// 🎨 Accent Switcher & Background Glow Engine
function initAccentPicker() {
  const savedAccent = localStorage.getItem('cse_gamma_accent_color') || 'cyan';
  setAccentColor(savedAccent);

  document.querySelectorAll('.accent-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const colorKey = dot.dataset.color;
      setAccentColor(colorKey);
    });
  });
}

function setAccentColor(colorKey) {
  const palette = ACCENT_PALETTES[colorKey] || ACCENT_PALETTES.cyan;
  state.activeAccent = colorKey;

  document.documentElement.style.setProperty('--accent-primary', palette.primary);
  document.documentElement.style.setProperty('--accent-primary-bg', palette.bg);

  document.querySelectorAll('.accent-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.color === colorKey);
  });

  localStorage.setItem('cse_gamma_accent_color', colorKey);
}

// Web Audio API Purr Sound Synthesizer 🎵
function playPurrSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio Context not allowed before user gesture
  }
}

// Interactive Neko Petting Handler
function initPettingSystem() {
  const purrPhrases = ["Purrr... 🐾", "nya~ 🐾", "MEOW! 🐾", "ฅ^•ﻌ•^ฅ", "Squeak! 🐾"];

  if (elements.nekoRoofCat) {
    elements.nekoRoofCat.addEventListener('click', () => {
      playPurrSound();
      const phrase = purrPhrases[Math.floor(Math.random() * purrPhrases.length)];
      elements.roofCatBubble.textContent = phrase;
      elements.nekoRoofCat.classList.add('petting');
      elements.roofCatBubble.classList.add('show');

      setTimeout(() => {
        elements.nekoRoofCat.classList.remove('petting');
        elements.roofCatBubble.classList.remove('show');
      }, 1600);
    });
  }

  if (elements.nekoSleepingCalendar) {
    elements.nekoSleepingCalendar.addEventListener('click', () => {
      playPurrSound();
      const phrase = purrPhrases[Math.floor(Math.random() * purrPhrases.length)];
      elements.calendarCatBubble.textContent = phrase;
      elements.calendarCatBubble.classList.add('show');

      setTimeout(() => {
        elements.calendarCatBubble.classList.remove('show');
      }, 1600);
    });
  }

  if (elements.nekoPeekingSearch) {
    elements.nekoPeekingSearch.addEventListener('click', () => {
      playPurrSound();
    });
  }
}

// 3D Card Hover Physics Calculator
function init3DTiltPhysics() {
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.stat-card, .undated-card, .event-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      } else {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      }
    });
  });
}

// LocalStorage Custom Events Engine
function loadCustomEventsFromStorage() {
  try {
    const raw = localStorage.getItem('cse_gamma_custom_events');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading custom events from localStorage:', e);
    return [];
  }
}

function saveCustomEventsToStorage(events) {
  try {
    localStorage.setItem('cse_gamma_custom_events', JSON.stringify(events));
  } catch (e) {
    console.error('Error saving custom events to localStorage:', e);
  }
}

function deleteCustomEvent(id) {
  state.customEvents = state.customEvents.filter(e => e.id !== id);
  saveCustomEventsToStorage(state.customEvents);
  processEvents();
  renderSubjectFilterChips();
  renderStats();
  renderView();

  // Instantly re-render active day modal if open
  if (state.selectedDateStr && elements.dayModal.classList.contains('active')) {
    const rawEvents = state.eventsByDate.get(state.selectedDateStr) || [];
    openDayDetailModal(state.selectedDateStr, rawEvents);
  }
}

// Category Tags
function getTypeTag(type) {
  switch ((type || '').toLowerCase()) {
    case 'exam': return { label: 'Exam', icon: '⚔️' };
    case 'assignment': return { label: 'Assignment', icon: '📜' };
    case 'class': return { label: 'Class', icon: '🐾' };
    case 'personal': return { label: 'Personal', icon: '🍃' };
    default: return { label: type || 'Event', icon: '📌' };
  }
}

// Format 24h -> 12h AM/PM
function formatTime(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Helper: Minimal Neko Empty State Builder
function createMinimalEmptyStateHtml(titleText, bodyText) {
  return `
    <div class="minimal-empty-state">
      <div class="minimal-neko-avatar">🐾 ฅ(≚ᄌ≚)ฅ 💤</div>
      <h4 class="minimal-empty-title">${titleText}</h4>
      <p class="minimal-empty-desc">${bodyText}</p>
      <button class="btn btn-sm reset-filters-btn" style="margin-top: 0.5rem;">
        Reset Filters 🐾
      </button>
    </div>
  `;
}

// Load Events Data (JSON + LocalStorage)
async function loadEvents() {
  state.isLoading = true;
  hideErrorBanner();
  
  try {
    const response = await fetch('events.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to fetch events data (HTTP ${response.status})`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: Expected a JSON array.');
    }
    
    state.customEvents = loadCustomEventsFromStorage();
    state.events = [...data, ...state.customEvents];

    processEvents();
    state.isLoading = false;
    
    if (state.datedEvents.length > 0) {
      const dates = state.datedEvents.map(e => e.date).sort();
      const firstDate = new Date(dates[0]);
      if (!isNaN(firstDate.getTime())) {
        state.currentYear = firstDate.getFullYear();
        state.currentMonth = firstDate.getMonth();
      }
    }

    renderSubjectFilterChips();
    renderStats();
    renderView();
  } catch (err) {
    console.error('Error loading events:', err);
    state.isLoading = false;
    state.error = err.message || "Couldn't load calendar data.";
    showErrorBanner(state.error);
  }
}

function processEvents() {
  state.events = [...state.events.filter(e => !e.isCustom), ...state.customEvents];

  const dated = [];
  const undated = [];
  
  state.events.forEach(event => {
    if (event.date && event.date !== null && event.date.trim() !== '') {
      dated.push(event);
    } else {
      undated.push(event);
    }
  });

  state.datedEvents = dated;
  state.undatedEvents = undated;
  state.eventsByDate = groupByDate(state.datedEvents);
}

function groupByDate(eventsList) {
  const map = new Map();
  eventsList.forEach(event => {
    if (!map.has(event.date)) {
      map.set(event.date, []);
    }
    map.get(event.date).push(event);
  });
  return map;
}

// Filter Logic
function filterEvent(event) {
  const matchesSubject = (state.selectedSubject === 'ALL') || 
    (!event.subject || event.subject.trim() === '') || 
    (event.subject.toUpperCase() === state.selectedSubject.toUpperCase());

  const matchesType = (state.selectedType === 'ALL') || 
    (event.type && event.type.toLowerCase() === state.selectedType.toLowerCase());

  const query = state.searchQuery.trim().toLowerCase();
  const matchesSearch = !query || 
    (event.title && event.title.toLowerCase().includes(query)) ||
    (event.description && event.description.toLowerCase().includes(query)) ||
    (event.subject && event.subject.toLowerCase().includes(query));

  return matchesSubject && matchesType && matchesSearch;
}

function renderSubjectFilterChips() {
  const subjectsSet = new Set();
  state.events.forEach(e => {
    if (e.subject && e.subject.trim() !== '') {
      subjectsSet.add(e.subject.trim());
    }
  });

  const subjects = Array.from(subjectsSet).sort();
  
  elements.subjectFilterGroup.innerHTML = `
    <span class="filter-label">Subject:</span>
    <button class="chip ${state.selectedSubject === 'ALL' ? 'active' : ''}" data-subject="ALL">All</button>
    ${subjects.map(sub => `
      <button class="chip ${state.selectedSubject === sub ? 'active' : ''}" data-subject="${sub}">${escapeHtml(sub)}</button>
    `).join('')}
  `;

  elements.subjectFilterGroup.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedSubject = btn.dataset.subject;
      renderSubjectFilterChips();
      renderView();
    });
  });
}

function setupTypeFilterChips() {
  elements.typeFilterGroup.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedType = btn.dataset.type;
      elements.typeFilterGroup.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      renderView();
    });
  });
}

function resetAllFilters() {
  state.selectedSubject = 'ALL';
  state.selectedType = 'ALL';
  state.searchQuery = '';
  elements.searchInput.value = '';
  renderSubjectFilterChips();
  elements.typeFilterGroup.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  elements.typeFilterGroup.querySelector('[data-type="ALL"]').classList.add('active');
  renderView();
}

// Render Views
function renderView() {
  updateHeaderDisplay();
  
  if (state.activeView === 'grid') {
    elements.calendarGrid.style.display = 'grid';
    elements.agendaWrapper.style.display = 'none';
    renderMonth(state.currentYear, state.currentMonth, state.eventsByDate);
  } else {
    elements.calendarGrid.style.display = 'none';
    elements.agendaWrapper.style.display = 'flex';
    renderAgendaView();
  }

  renderUndatedSection(state.undatedEvents);
  bindResetFilterBtns();
  bindDeleteEventBtns();
}

function bindResetFilterBtns() {
  document.querySelectorAll('.reset-filters-btn').forEach(btn => {
    btn.addEventListener('click', resetAllFilters);
  });
}

function bindDeleteEventBtns() {
  document.querySelectorAll('.delete-event-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (confirm('Delete this custom quest?')) {
        deleteCustomEvent(id);
      }
    });
  });
}

function updateHeaderDisplay() {
  elements.currentMonthDisplay.textContent = `${MONTH_NAMES[state.currentMonth]} ${state.currentYear}`;
}

function renderStats() {
  elements.statTotalEvents.textContent = state.events.length;
  elements.statTotalExams.textContent = state.events.filter(e => e.type === 'exam').length;
  elements.statTotalAssignments.textContent = state.events.filter(e => e.type === 'assignment').length;
  elements.statTotalUndated.textContent = state.undatedEvents.length;
}

// Grid Month Renderer
function renderMonth(year, month, eventsByDate) {
  const grid = elements.calendarGrid;
  grid.innerHTML = '';

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentRealMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDateNum = today.getDate();

  // Prev Month Days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevMonthDate = new Date(year, month - 1, dayNum);
    const dateStr = formatDateKey(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, dayNum);
    grid.appendChild(createDayCell(dateStr, dayNum, true, false, eventsByDate));
  }

  // Current Month Days
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = formatDateKey(year, month + 1, d);
    const isToday = isCurrentRealMonth && d === todayDateNum;
    grid.appendChild(createDayCell(dateStr, d, false, isToday, eventsByDate));
  }

  // Next Month Days
  const cellCountSoFar = firstDayIndex + totalDays;
  const targetTotalCells = cellCountSoFar > 35 ? 42 : 35;
  const remainingCells = targetTotalCells - cellCountSoFar;

  for (let n = 1; n <= remainingCells; n++) {
    const nextMonthDate = new Date(year, month + 1, n);
    const dateStr = formatDateKey(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1, n);
    grid.appendChild(createDayCell(dateStr, n, true, false, eventsByDate));
  }
}

function createDayCell(dateStr, dayNum, isOtherMonth, isToday, eventsByDate) {
  const cell = document.createElement('div');
  cell.className = `calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''}`;
  cell.dataset.date = dateStr;

  const rawDayEvents = eventsByDate.get(dateStr) || [];
  const filteredDayEvents = rawDayEvents.filter(filterEvent);

  let dayHeaderHtml = `
    <div class="day-header-row">
      <span class="day-number">${dayNum}</span>
      ${filteredDayEvents.length > 0 ? `<span class="event-count-badge">${filteredDayEvents.length}</span>` : ''}
    </div>
  `;

  let eventsPreviewHtml = '';
  if (filteredDayEvents.length > 0) {
    eventsPreviewHtml = `<div class="day-events-preview">`;
    
    const displayPills = filteredDayEvents.slice(0, 2);
    displayPills.forEach(ev => {
      const typeClass = `type-${ev.type || 'class'}`;
      eventsPreviewHtml += `
        <div class="event-pill ${typeClass}" title="${escapeHtml(ev.title)}">
          <span>${escapeHtml(ev.title)}</span>
        </div>
      `;
    });

    if (filteredDayEvents.length > 2) {
      eventsPreviewHtml += `
        <div class="event-dots-row">
          ${filteredDayEvents.slice(2).map(ev => `<span class="dot dot-${ev.type || 'class'}"></span>`).join('')}
        </div>
      `;
    }

    eventsPreviewHtml += `</div>`;
  }

  cell.innerHTML = dayHeaderHtml + eventsPreviewHtml;

  cell.addEventListener('click', () => {
    openDayDetailModal(dateStr, rawDayEvents);
  });

  return cell;
}

function formatDateKey(year, month1Indexed, day) {
  const m = month1Indexed < 10 ? `0${month1Indexed}` : month1Indexed;
  const d = day < 10 ? `0${day}` : day;
  return `${year}-${m}-${d}`;
}

// Agenda List Renderer
function renderAgendaView() {
  const wrapper = elements.agendaWrapper;
  wrapper.innerHTML = '';

  const monthStartStr = formatDateKey(state.currentYear, state.currentMonth + 1, 1);
  const lastDay = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const monthEndStr = formatDateKey(state.currentYear, state.currentMonth + 1, lastDay);

  const monthDates = Array.from(state.eventsByDate.keys())
    .filter(d => d >= monthStartStr && d <= monthEndStr)
    .sort();

  let totalFiltered = 0;

  monthDates.forEach(dateStr => {
    const rawEvents = state.eventsByDate.get(dateStr) || [];
    const filtered = rawEvents.filter(filterEvent);
    
    if (filtered.length > 0) {
      totalFiltered += filtered.length;
      
      const dayGroup = document.createElement('div');
      dayGroup.className = 'agenda-day-group';
      dayGroup.innerHTML = `
        <div class="agenda-date-header">
          <span>${formatDateLong(dateStr)} 🐾</span>
          <span class="badge badge-subject">${filtered.length} event${filtered.length > 1 ? 's' : ''}</span>
        </div>
        <div class="agenda-events-list">
          ${filtered.map(renderEventCardHtml).join('')}
        </div>
      `;
      wrapper.appendChild(dayGroup);
    }
  });

  if (totalFiltered === 0) {
    wrapper.innerHTML = createMinimalEmptyStateHtml(
      "Neko is Sleeping 🐾 💤",
      `No events match your current filter selections for ${MONTH_NAMES[state.currentMonth]} ${state.currentYear}.`
    );
  }
}

// Undated Section Renderer
function renderUndatedSection(undatedList) {
  const container = elements.undatedGrid;
  const filtered = undatedList.filter(filterEvent);

  if (filtered.length === 0) {
    if (undatedList.length === 0) {
      elements.undatedSection.style.display = 'none';
    } else {
      elements.undatedSection.style.display = 'block';
      container.innerHTML = `
        <div style="grid-column: 1 / -1;">
          ${createMinimalEmptyStateHtml("All Tasks Clear 🐾", "No pending tasks match the current active filters.")}
        </div>
      `;
    }
    return;
  }

  elements.undatedSection.style.display = 'block';
  container.innerHTML = filtered.map(ev => {
    const typeInfo = getTypeTag(ev.type);
    return `
      <div class="undated-card">
        <div class="event-card-main">
          <div class="event-meta">
            <span class="badge badge-type type-${ev.type || 'class'}">${typeInfo.label}</span>
            ${ev.subject && ev.subject.trim() !== '' ? `<span class="badge badge-subject">${escapeHtml(ev.subject)}</span>` : ''}
            ${ev.isCustom ? `<span class="badge badge-custom">Custom Quest</span>` : ''}
          </div>
          <h4 class="event-title" style="margin-top: 0.25rem;">${escapeHtml(ev.title)}</h4>
          ${ev.description && ev.description.trim() !== '' ? `<p class="event-desc">${escapeHtml(ev.description)}</p>` : ''}
        </div>
        ${ev.isCustom ? `<button class="delete-event-btn" data-id="${ev.id}" title="Delete custom quest">✕</button>` : ''}
      </div>
    `;
  }).join('');
}

function renderEventCardHtml(ev) {
  const formattedTimeStr = formatTime(ev.time);
  const typeInfo = getTypeTag(ev.type);

  return `
    <div class="event-card">
      <div class="event-card-main">
        <div class="event-meta">
          <span class="badge badge-type type-${ev.type || 'class'}">${typeInfo.label}</span>
          ${formattedTimeStr ? `<span class="badge badge-subject">🕒 ${formattedTimeStr}</span>` : '<span class="badge badge-subject">All Day</span>'}
          ${ev.subject && ev.subject.trim() !== '' ? `<span class="badge badge-subject">${escapeHtml(ev.subject)}</span>` : ''}
          ${ev.isCustom ? `<span class="badge badge-custom">Custom</span>` : ''}
        </div>
        <h4 class="event-title">${escapeHtml(ev.title)}</h4>
        ${ev.description && ev.description.trim() !== '' ? `<p class="event-desc">${escapeHtml(ev.description)}</p>` : ''}
      </div>
      ${ev.isCustom ? `<button class="delete-event-btn" data-id="${ev.id}" title="Delete custom quest">✕</button>` : ''}
    </div>
  `;
}

// Modal Handlers
function openDayDetailModal(dateStr, rawDayEvents) {
  state.selectedDateStr = dateStr;
  const filteredEvents = rawDayEvents.filter(filterEvent);

  elements.modalDateTitle.textContent = `${formatDateLong(dateStr)} 🐾`;
  elements.modalEventCount.textContent = `${filteredEvents.length} event${filteredEvents.length === 1 ? '' : 's'} scheduled`;

  if (filteredEvents.length === 0) {
    elements.modalEventsList.innerHTML = createMinimalEmptyStateHtml(
      "Neko Rest Day 🐾 💤",
      "No events scheduled for this specific date."
    );
  } else {
    elements.modalEventsList.innerHTML = filteredEvents.map(renderEventCardHtml).join('');
  }

  elements.dayModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  bindResetFilterBtns();
  bindDeleteEventBtns();
}

function closeDayDetailModal() {
  elements.dayModal.classList.remove('active');
  document.body.style.overflow = '';
  state.selectedDateStr = null;
}

// Add Custom Quest Modal Handlers with Date Pre-fill
function openAddQuestModal(prefilledDateStr = null) {
  if (prefilledDateStr) {
    elements.questDateInput.value = prefilledDateStr;
  }
  elements.addQuestModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAddQuestModal() {
  elements.addQuestModal.classList.remove('active');
  document.body.style.overflow = '';
  elements.addQuestForm.reset();
}

function handleAddQuestSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('quest-title').value.trim();
  const date = elements.questDateInput.value.trim();
  const time = document.getElementById('quest-time').value.trim();
  const subject = document.getElementById('quest-subject').value.trim();
  const type = document.getElementById('quest-type').value;
  const description = document.getElementById('quest-desc').value.trim();

  if (!title) return;

  const newQuest = {
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title,
    date: date || null,
    time: time || null,
    subject: subject || '',
    type: type || 'class',
    description: description || '',
    isCustom: true
  };

  state.customEvents.push(newQuest);
  saveCustomEventsToStorage(state.customEvents);
  
  processEvents();
  renderSubjectFilterChips();
  renderStats();
  renderView();

  closeAddQuestModal();
}

// Controls Logic
function changeMonth(delta) {
  state.currentMonth += delta;
  if (state.currentMonth > 11) {
    state.currentMonth = 0;
    state.currentYear += 1;
  } else if (state.currentMonth < 0) {
    state.currentMonth = 11;
    state.currentYear -= 1;
  }
  renderView();
}

function jumpToToday() {
  const now = new Date();
  state.currentYear = now.getFullYear();
  state.currentMonth = now.getMonth();
  renderView();
}

// iCal Exporter
function exportICS() {
  if (state.datedEvents.length === 0) {
    alert("No dated events to export.");
    return;
  }

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CSE Gamma Minimalist Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  state.datedEvents.forEach(ev => {
    const cleanDateStr = ev.date.replace(/-/g, '');
    let dtStart = cleanDateStr;
    let dtEnd = cleanDateStr;

    if (ev.time) {
      const cleanTimeStr = ev.time.replace(/:/g, '') + "00";
      dtStart += `T${cleanTimeStr}`;
      const [h, m] = ev.time.split(':').map(Number);
      const endH = (h + 1).toString().padStart(2, '0');
      dtEnd += `T${endH}${m.toString().padStart(2, '0')}00`;
    }

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:${ev.id || Math.random().toString(36).substring(2)}@cse-gamma`,
      `SUMMARY:${ev.title || 'Event'}`,
      `DESCRIPTION:${ev.description ? ev.description.replace(/\n/g, '\\n') : ''}`,
      ev.time ? `DTSTART:${dtStart}` : `DTSTART;VALUE=DATE:${dtStart}`,
      ev.time ? `DTEND:${dtEnd}` : `DTEND;VALUE=DATE:${dtEnd}`,
      `CATEGORIES:${ev.type || 'class'}`,
      "END:VEVENT"
    );
  });

  icsContent.push("END:VCALENDAR");

  const blob = new Blob([icsContent.join("\r\n")], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'cse_gamma_calendar.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function showErrorBanner(msg) {
  elements.errorMessage.textContent = msg;
  elements.errorBanner.style.display = 'flex';
}

function hideErrorBanner() {
  elements.errorBanner.style.display = 'none';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function (match) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match];
  });
}

function initApp() {
  document.documentElement.setAttribute('data-theme', 'dark');

  elements.prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  elements.nextMonthBtn.addEventListener('click', () => changeMonth(1));
  elements.todayBtn.addEventListener('click', jumpToToday);

  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderView();
  });

  elements.viewToggleBtn.addEventListener('click', () => {
    state.activeView = state.activeView === 'grid' ? 'list' : 'grid';
    elements.viewToggleBtn.querySelector('span').textContent = state.activeView === 'grid' ? 'List View' : 'Grid View';
    renderView();
  });

  elements.exportIcsBtn.addEventListener('click', exportICS);
  
  // Custom Quest Modal Listeners
  elements.addQuestBtn.addEventListener('click', () => openAddQuestModal());
  elements.modalAddQuestBtn.addEventListener('click', () => {
    const selectedDate = state.selectedDateStr;
    closeDayDetailModal();
    openAddQuestModal(selectedDate);
  });

  elements.addModalCloseBtn.addEventListener('click', closeAddQuestModal);
  elements.addModalCancelBtn.addEventListener('click', closeAddQuestModal);
  elements.addQuestForm.addEventListener('submit', handleAddQuestSubmit);
  elements.addQuestModal.addEventListener('click', (e) => {
    if (e.target === elements.addQuestModal) closeAddQuestModal();
  });

  elements.modalCloseBtn.addEventListener('click', closeDayDetailModal);
  elements.dayModal.addEventListener('click', (e) => {
    if (e.target === elements.dayModal) closeDayDetailModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (elements.dayModal.classList.contains('active')) closeDayDetailModal();
      if (elements.addQuestModal.classList.contains('active')) closeAddQuestModal();
    }
  });

  elements.retryBtn.addEventListener('click', loadEvents);

  initAccentPicker();
  setupTypeFilterChips();
  initPettingSystem();
  init3DTiltPhysics();
  loadEvents();
}

document.addEventListener('DOMContentLoaded', initApp);
