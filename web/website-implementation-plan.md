# Class Calendar — Static Site Implementation Plan

## 1. Goal
A static site (GitHub Pages) that reads `events.json` from the repo and renders it as a month calendar. No backend, no build step required (plain HTML/JS/CSS).

## 2. File structure
```
class-calendar/
├── index.html
├── style.css
├── app.js
├── events.json          ← data file, edited by the Flutter app later
└── README.md
```

## 3. Data schema

Each event:

```json
{
  "id": "string (uuid)",
  "title": "string",
  "date": "YYYY-MM-DD or null",
  "time": "HH:MM or null",
  "type": "exam | assignment | class | personal",
  "subject": "string, optional",
  "description": "string, optional"
}
```

`events.json` is a flat array of these objects.

**`date: null` means "no due date yet"** — common when a teacher announces an assignment exists before announcing when it's due. These events can't go on the calendar grid (no cell to put them in), so they need a separate home — see §4 and §6.

**`subject` is optional** — things like "Class Reminder" or "Study Group" aren't tied to one subject, so this can be left blank. When present, it's a free-text or picklist value like `"Math"`, `"Physics"`, `"History"`.

### Test JSON (use this to build + verify the site before the app exists)

```json
[
  {
    "id": "e1",
    "title": "Midterm Exam",
    "date": "2026-08-20",
    "time": "10:00",
    "type": "exam",
    "subject": "Physics",
    "description": "Chapters 1-5, room 204"
  },
  {
    "id": "e2",
    "title": "Essay Draft Due",
    "date": "2026-08-20",
    "time": null,
    "type": "assignment",
    "subject": "English",
    "description": "Submit via portal"
  },
  {
    "id": "e3",
    "title": "Guest Lecture",
    "date": "2026-08-22",
    "time": "14:00",
    "type": "class",
    "subject": "History",
    "description": "Dr. Amara on climate policy"
  },
  {
    "id": "e4",
    "title": "Study Group",
    "date": "2026-08-27",
    "time": "18:30",
    "type": "personal",
    "subject": "",
    "description": ""
  },
  {
    "id": "e5",
    "title": "Problem Set 3",
    "date": "2026-09-01",
    "time": null,
    "type": "assignment",
    "subject": "Math",
    "description": "Late penalty after 11:59pm"
  },
  {
    "id": "e6",
    "title": "Final Project",
    "date": null,
    "time": null,
    "type": "assignment",
    "subject": "Physics",
    "description": "Announced in class, due date TBD"
  }
]
```

This deliberately includes: two events on the same day (e1 + e2), an event with no time, an event with no description, events spanning two different months, one event with **no date at all** (e6), and one event with **no subject** (e4, "Study Group" — a class reminder that isn't tied to a specific subject) — enough to verify grid rendering, multi-event days, month navigation, the undated-events case, and the subject-less case.

## 4. Rendering logic

1. On load, `fetch('events.json')` → parse JSON.
2. Split into two sets: events with a `date` and events where `date` is `null`.
3. Group the dated events by `date` into a map: `{ "2026-08-20": [e1, e2], ... }`.
4. Render current month as a 7-column grid (Sun–Sat).
   - Pad leading/trailing cells from adjacent months (greyed out).
   - Each day cell shows the date number + a small colored dot per event type present that day (color-coded, see §6).
5. Tapping/clicking a day opens a panel (or expands the cell) listing that day's events with title, time, **subject (if present)**, and description.
6. Prev/Next month buttons re-render the grid; no refetch needed since all data is already loaded client-side.
7. Below the grid (always visible, not tied to a month), render an **"Undated" section** listing every event where `date` is null — just title, type, subject (if any), and description. This is the only place these events appear, since they have no calendar cell to live in.
8. Optional filter bar above the grid: a row of subject chips (derived from the unique `subject` values present in the data, e.g. Math/Physics/English) to show/hide events by subject. Events with no `subject` always show regardless of filter, since they're general reminders, not tied to a class.

## 5. Core functions (app.js)

- `loadEvents()` — fetch + parse `events.json`, handle fetch failure (show "couldn't load calendar data" state)
- `splitDatedUndated(events)` — separates events into dated / `date: null`
- `groupByDate(events)` — returns date-keyed map (dated events only)
- `renderMonth(year, month, eventsByDate)` — builds the grid DOM
- `renderDayDetail(dateStr, eventsByDate)` — builds the event list panel
- `renderUndatedSection(undatedEvents)` — builds the "no due date yet" list
- `changeMonth(delta)` — updates current year/month state, re-renders

## 6. Styling / type color coding
- exam → red
- assignment → amber
- class → blue
- personal → green

Keep it simple: a CSS custom property map, one class per type (`.dot-exam`, `.dot-assignment`, etc). `subject` is shown as text (small label/badge), not a separate color system — mixing two color-coded dimensions (type + subject) gets visually noisy on a small day cell. If you later want per-subject colors too, that's a v2 addition, not part of this build.

## 7. Deployment
1. Push repo to GitHub.
2. Settings → Pages → deploy from `main` branch, root folder.
3. Site live at `https://<username>.github.io/class-calendar/`.
4. No CI needed — GitHub Pages serves `events.json` as a static asset, so any future push (from the Flutter app) is reflected on next page load automatically.

## 8. Testing checklist (using the test JSON above)
- [ ] Two events on same day both show as separate dots and both appear in day detail
- [ ] Event with `time: null` renders without a broken/blank time field
- [ ] Event with empty `description` renders cleanly (no "undefined")
- [ ] Navigating from August → September shows Problem Set 3 correctly
- [ ] Navigating to a month with zero events shows an empty grid, not an error
- [ ] Broken/missing `events.json` shows a graceful error state, not a blank page
- [ ] Mobile viewport (375px width) — grid stays usable, day detail panel doesn't overflow
- [ ] Event with `date: null` (e6) does **not** appear anywhere on the grid, and does appear in the Undated section
- [ ] Undated section with zero entries hides itself (or shows a clean "nothing pending" state) rather than an empty box
- [ ] Event with empty `subject` (e4) renders without a broken/blank subject badge
- [ ] Subject filter chips are generated correctly from the test data's unique subjects (Physics, English, History, Math) and filtering hides/shows the right events

## 9. Nice-to-haves (later, not v1)
- Generate `.ics` export button so it's importable to Google/Apple Calendar
- Highlight "today" on the grid
- List view toggle (chronological list instead of grid)
