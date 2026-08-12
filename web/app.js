/**
 * Class Calendar - Peach Manga & Samurai Torii Engine (with Mini Neko Cats)
 * Bright Light Mode & Animated Samurai Empty State
 */

// Application State
const state = {
  events: [],
  datedEvents: [],
  undatedEvents: [],
  eventsByDate: new Map(),
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(), // 0-indexed
  selectedSubject: 'ALL',
  selectedType: 'ALL',
  searchQuery: '',
  activeView: 'grid', // 'grid' or 'list'
  selectedDateStr: null,
  isLoading: true,
  error: null
};

// Japanese Month Kanji & Manga Titles
const JAPANESE_MONTHS = [
  { english: "January", kanji: "1月 睦月 (Mutzuki)" },
  { english: "February", kanji: "2月 如月 (Kisaragi)" },
  { english: "March", kanji: "3月 弥生 (Yayoi)" },
  { english: "April", kanji: "4月 卯月 (Uzuki)" },
  { english: "May", kanji: "5月 皐月 (Satsuki)" },
  { english: "June", kanji: "6月 水無月 (Minazuki)" },
  { english: "July", kanji: "7月 文月 (Fumizuki)" },
  { english: "August", kanji: "8月 葉月 (Hazuki)" },
  { english: "September", kanji: "9月 長月 (Nagatsuki)" },
  { english: "October", kanji: "10月 神無月 (Kannazuki)" },
  { english: "November", kanji: "11月 霜月 (Shimotsuki)" },
  { english: "December", kanji: "12月 師走 (Shiwasu)" }
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
  errorBanner: document.getElementById('error-banner'),
  errorMessage: document.getElementById('error-message'),
  retryBtn: document.getElementById('retry-btn'),
  // Stats
  statTotalEvents: document.getElementById('stat-total-events'),
  statTotalExams: document.getElementById('stat-total-exams'),
  statTotalAssignments: document.getElementById('stat-total-assignments'),
  statTotalUndated: document.getElementById('stat-total-undated')
};

// Category Tags
function getTypeTag(type) {
  switch ((type || '').toLowerCase()) {
    case 'exam': return { label: 'Exam 試', icon: '⚔️' };
    case 'assignment': return { label: 'Assignment 巻', icon: '📜' };
    case 'class': return { label: 'Class 🌸', icon: '🍑' };
    case 'personal': return { label: 'Personal 心', icon: '🍃' };
    default: return { label: type || 'Quest', icon: '⛩️' };
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

// Format Date YYYY-MM-DD
function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Helper: Animated Samurai Empty State Builder
function createSamuraiEmptyStateHtml(titleText, bodyText) {
  return `
    <div class="samurai-empty-card animate-fade-in">
      <div class="samurai-avatar-wrapper">
        <div class="samurai-emblem-circle">⚔️</div>
        <div class="katana-slash-blade"></div>
      </div>
      <div class="samurai-sound-callout">ズバッ! (ZUBAT!)</div>
      <h3 class="samurai-empty-title">${titleText}</h3>
      <p class="samurai-empty-desc">${bodyText}</p>
      <button class="btn btn-peach reset-filters-btn" style="margin-top: 0.5rem; font-size: 0.85rem;">
        ⛩️ Rest at Dojo & Reset Filters
      </button>
    </div>
  `;
}

// Load Events Data
async function loadEvents() {
  state.isLoading = true;
  hideErrorBanner();
  
  try {
    const response = await fetch('events.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to fetch events data (HTTP status ${response.status})`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format: Expected a JSON array of events.');
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
    state.error = err.message || "Couldn't load calendar data.";
    showErrorBanner(state.error);
  }
}

function processEvents() {
  const { dated, undated } = splitDatedUndated(state.events);
  state.datedEvents = dated;
  state.undatedEvents = undated;
  state.eventsByDate = groupByDate(state.datedEvents);
}

function splitDatedUndated(eventsList) {
  const dated = [];
  const undated = [];
  
  eventsList.forEach(event => {
    if (event.date && event.date !== null && event.date.trim() !== '') {
      dated.push(event);
    } else {
      undated.push(event);
    }
  });

  return { dated, undated };
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
    <button class="chip ${state.selectedSubject === 'ALL' ? 'active' : ''}" data-subject="ALL">All Subjects</button>
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

// Render View Logic
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
  const monthData = JAPANESE_MONTHS[state.currentMonth];
  elements.currentMonthDisplay.innerHTML = `
    ${monthData.english} ${state.currentYear}
    <span class="month-kanji-sub">${monthData.kanji.split(' ')[0]}</span>
  `;
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
      dayGroup.className = 'agenda-day-group animate-fade-in';
      dayGroup.innerHTML = `
        <div class="agenda-date-header">
          <span>${formatDateLong(dateStr)}</span>
          <span class="badge badge-subject">${filtered.length} quest${filtered.length > 1 ? 's' : ''}</span>
        </div>
        <div class="agenda-events-list">
          ${filtered.map(renderEventCardHtml).join('')}
        </div>
      `;
      wrapper.appendChild(dayGroup);
    }
  });

  if (totalFiltered === 0) {
    wrapper.innerHTML = createSamuraiEmptyStateHtml(
      "Bushido Peace Reigns! ⛩️",
      `All quests have been vanquished or no events match your filters for ${JAPANESE_MONTHS[state.currentMonth].english} ${state.currentYear}.`
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
          ${createSamuraiEmptyStateHtml("No Pending Scroll Quests 📜", "Your samurai scroll log is completely clear for the active filters.")}
        </div>
      `;
    }
    return;
  }

  elements.undatedSection.style.display = 'block';
  container.innerHTML = filtered.map(ev => {
    const typeInfo = getTypeTag(ev.type);
    return `
      <div class="undated-card animate-fade-in">
        <div class="event-card-main">
          <div class="event-meta">
            <span class="badge badge-type type-${ev.type || 'class'}">${typeInfo.icon} ${typeInfo.label}</span>
            ${ev.subject && ev.subject.trim() !== '' ? `<span class="badge badge-subject">📚 ${escapeHtml(ev.subject)}</span>` : ''}
          </div>
          <h4 class="event-title" style="margin-top: 0.5rem;">${escapeHtml(ev.title)}</h4>
          ${ev.description && ev.description.trim() !== '' ? `<p class="event-desc">${escapeHtml(ev.description)}</p>` : ''}
        </div>
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
          <span class="badge badge-type type-${ev.type || 'class'}">${typeInfo.icon} ${typeInfo.label}</span>
          ${formattedTimeStr ? `<span class="badge badge-subject">🕒 ${formattedTimeStr}</span>` : '<span class="badge badge-subject">All Day 終日</span>'}
          ${ev.subject && ev.subject.trim() !== '' ? `<span class="badge badge-subject">📚 ${escapeHtml(ev.subject)}</span>` : ''}
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

  elements.modalDateTitle.textContent = `${formatDateLong(dateStr)} 🐾`;
  elements.modalEventCount.textContent = `${filteredEvents.length} quest${filteredEvents.length === 1 ? '' : 's'} scheduled`;

  if (filteredEvents.length === 0) {
    elements.modalEventsList.innerHTML = createSamuraiEmptyStateHtml(
      "Dojo Rest Day 🍃",
      "No samurai quests scheduled for this date. Time to meditate!"
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
    "PRODID:-//Peach Manga Samurai Calendar//EN",
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
      `UID:${ev.id || Math.random().toString(36).substring(2)}@samurai-calendar`,
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
  link.download = 'peach_manga_samurai_calendar.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Peach Blossom Canvas Animation Engine
function initPeachPetals() {
  const canvas = document.getElementById('sakura-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const PETAL_COUNT = 36;
  const petals = [];

  for (let i = 0; i < PETAL_COUNT; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 9 + 6,
      speedY: Math.random() * 1.3 + 0.5,
      speedX: Math.random() * 0.9 - 0.45,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 2.5 - 1.25,
      opacity: Math.random() * 0.55 + 0.35,
      isSparkle: Math.random() > 0.75
    });
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    
    if (p.isSparkle) {
      ctx.fillStyle = `rgba(255, 159, 67, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = `rgba(255, 107, 129, ${p.opacity})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-p.size, -p.size, -p.size * 1.4, p.size / 2, 0, p.size * 1.4);
      ctx.bezierCurveTo(p.size * 1.4, p.size / 2, p.size, -p.size, 0, 0);
      ctx.fill();
    }
    ctx.restore();
  }

  function renderLoop() {
    ctx.clearRect(0, 0, width, height);

    petals.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.4;
      p.rotation += p.rotSpeed;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }
      if (p.x > width + 20) p.x = -20;
      if (p.x < -20) p.x = width + 20;

      drawPetal(p);
    });

    requestAnimationFrame(renderLoop);
  }

  renderLoop();
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
  // Enforce Light Theme Permanently
  document.documentElement.setAttribute('data-theme', 'light');

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
  elements.modalCloseBtn.addEventListener('click', closeDayDetailModal);
  elements.dayModal.addEventListener('click', (e) => {
    if (e.target === elements.dayModal) closeDayDetailModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.dayModal.classList.contains('active')) {
      closeDayDetailModal();
    }
  });

  elements.retryBtn.addEventListener('click', loadEvents);

  setupTypeFilterChips();
  initPeachPetals();
  loadEvents();
}

document.addEventListener('DOMContentLoaded', initApp);
