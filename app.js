/**
 * CSE GAMMA — BERSERK MONOCHROME ENGINE [100% PURE BLACK & WHITE]
 */

// Application State
const state = {
  events: [],
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
  isLoading: true,
  error: null
};

// Month Titles
const MONTH_NAMES = [
  "JANUARY 1月", "FEBRUARY 2月", "MARCH 3月", "APRIL 4月", "MAY 5月", "JUNE 6月",
  "JULY 7月", "AUGUST 8月", "SEPTEMBER 9月", "OCTOBER 10月", "NOVEMBER 11月", "DECEMBER 12月"
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
  dayModal: document.getElementById('day-modal'),
  modalDateTitle: document.getElementById('modal-date-title'),
  modalEventCount: document.getElementById('modal-event-count'),
  modalEventsList: document.getElementById('modal-events-list'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  statTotalEvents: document.getElementById('stat-total-events'),
  statTotalExams: document.getElementById('stat-total-exams'),
  statTotalAssignments: document.getElementById('stat-total-assignments'),
  statTotalUndated: document.getElementById('stat-total-undated')
};

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

// Format Date YYYY-MM-DD
function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();
}

// Minimalist Black & White Empty State Builder
function createMonoEmptyStateHtml(titleText, bodyText) {
  return `
    <div class="mono-empty-card">
      <div class="mono-empty-symbol">// ⚔️ //</div>
      <h3 class="mono-empty-title">${titleText}</h3>
      <p class="mono-empty-desc">${bodyText}</p>
      <button class="mono-btn mono-btn-fill reset-filters-btn" style="margin-top: 0.5rem; font-size: 0.75rem;">
        RESET FILTERS
      </button>
    </div>
  `;
}

// Load Events Data
async function loadEvents() {
  state.isLoading = true;
  
  try {
    const response = await fetch('events.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Expected JSON array');
    }
    
    state.events = data;
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
  }
}

function processEvents() {
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
    <span class="chip-label">SUBJECT:</span>
    <button class="mono-chip ${state.selectedSubject === 'ALL' ? 'active' : ''}" data-subject="ALL">ALL</button>
    ${subjects.map(sub => `
      <button class="mono-chip ${state.selectedSubject === sub ? 'active' : ''}" data-subject="${sub}">${escapeHtml(sub)}</button>
    `).join('')}
  `;

  elements.subjectFilterGroup.querySelectorAll('.mono-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedSubject = btn.dataset.subject;
      renderSubjectFilterChips();
      renderView();
    });
  });
}

function setupTypeFilterChips() {
  elements.typeFilterGroup.querySelectorAll('.mono-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedType = btn.dataset.type;
      elements.typeFilterGroup.querySelectorAll('.mono-chip').forEach(c => c.classList.remove('active'));
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
  elements.typeFilterGroup.querySelectorAll('.mono-chip').forEach(c => c.classList.remove('active'));
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
}

function bindResetFilterBtns() {
  document.querySelectorAll('.reset-filters-btn').forEach(btn => {
    btn.addEventListener('click', resetAllFilters);
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
      eventsPreviewHtml += `
        <div class="event-pill" title="${escapeHtml(ev.title)}">
          <span>${escapeHtml(ev.title)}</span>
        </div>
      `;
    });

    if (filteredDayEvents.length > 2) {
      eventsPreviewHtml += `
        <div class="event-dots-row">
          ${filteredDayEvents.slice(2).map(() => `<span class="dot"></span>`).join('')}
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
          <span>${formatDateLong(dateStr)}</span>
          <span class="badge">${filtered.length} QUESTS</span>
        </div>
        <div class="agenda-events-list">
          ${filtered.map(renderEventCardHtml).join('')}
        </div>
      `;
      wrapper.appendChild(dayGroup);
    }
  });

  if (totalFiltered === 0) {
    wrapper.innerHTML = createMonoEmptyStateHtml(
      "NO QUESTS FOUND",
      `No events match your current filter selections.`
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
          ${createMonoEmptyStateHtml("ALL SCROLLS CLEAR", "No pending tasks match active filters.")}
        </div>
      `;
    }
    return;
  }

  elements.undatedSection.style.display = 'block';
  container.innerHTML = filtered.map(ev => {
    return `
      <div class="undated-card">
        <div class="event-card-main">
          <div class="event-meta">
            <span class="badge">${(ev.type || 'QUEST').toUpperCase()}</span>
            ${ev.subject && ev.subject.trim() !== '' ? `<span class="badge">${escapeHtml(ev.subject)}</span>` : ''}
          </div>
          <h4 class="event-title" style="margin-top: 0.3rem;">${escapeHtml(ev.title)}</h4>
          ${ev.description && ev.description.trim() !== '' ? `<p class="event-desc">${escapeHtml(ev.description)}</p>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderEventCardHtml(ev) {
  const formattedTimeStr = formatTime(ev.time);

  return `
    <div class="event-card">
      <div class="event-card-main">
        <div class="event-meta">
          <span class="badge">${(ev.type || 'QUEST').toUpperCase()}</span>
          ${formattedTimeStr ? `<span class="badge">🕒 ${formattedTimeStr}</span>` : '<span class="badge">ALL DAY</span>'}
          ${ev.subject && ev.subject.trim() !== '' ? `<span class="badge">${escapeHtml(ev.subject)}</span>` : ''}
        </div>
        <h4 class="event-title">${escapeHtml(ev.title)}</h4>
        ${ev.description && ev.description.trim() !== '' ? `<p class="event-desc">${escapeHtml(ev.description)}</p>` : ''}
      </div>
    </div>
  `;
}

// Modal Handlers
function openDayDetailModal(dateStr, rawDayEvents) {
  state.selectedDateStr = dateStr;
  const filteredEvents = rawDayEvents.filter(filterEvent);

  elements.modalDateTitle.textContent = formatDateLong(dateStr);
  elements.modalEventCount.textContent = `${filteredEvents.length} QUESTS SCHEDULED`;

  if (filteredEvents.length === 0) {
    elements.modalEventsList.innerHTML = createMonoEmptyStateHtml(
      "REST DAY",
      "No events scheduled for this date."
    );
  } else {
    elements.modalEventsList.innerHTML = filteredEvents.map(renderEventCardHtml).join('');
  }

  elements.dayModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  bindResetFilterBtns();
}

function closeDayDetailModal() {
  elements.dayModal.classList.remove('active');
  document.body.style.overflow = '';
  state.selectedDateStr = null;
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
    alert("No dated quests to export.");
    return;
  }

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Berserk Monochrome Calendar//EN",
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
      `UID:${ev.id || Math.random().toString(36).substring(2)}@berserk-mono`,
      `SUMMARY:${ev.title || 'Quest'}`,
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
  link.download = 'berserk_monochrome_calendar.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  document.documentElement.setAttribute('data-theme', 'monochrome');

  elements.prevMonthBtn.addEventListener('click', () => changeMonth(-1));
  elements.nextMonthBtn.addEventListener('click', () => changeMonth(1));
  elements.todayBtn.addEventListener('click', jumpToToday);

  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderView();
  });

  elements.viewToggleBtn.addEventListener('click', () => {
    state.activeView = state.activeView === 'grid' ? 'list' : 'grid';
    elements.viewToggleBtn.textContent = state.activeView === 'grid' ? 'LIST VIEW' : 'GRID VIEW';
    renderView();
  });

  elements.exportIcsBtn.addEventListener('click', exportICS);
  elements.modalCloseBtn.addEventListener('click', closeDayDetailModal);
  elements.dayModal.addEventListener('click', (e) => {
    if (e.target === elements.dayModal) closeDayDetailModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.dayModal.classList.contains('active')) {
      closeDayDetailModal();
    }
  });

  setupTypeFilterChips();
  loadEvents();
}

document.addEventListener('DOMContentLoaded', initApp);
