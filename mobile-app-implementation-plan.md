# Class Calendar — Flutter Mobile Editor Implementation Plan

## 1. Goal
A Flutter app for adding/editing/deleting events, which commits changes directly to `events.json` in the GitHub repo via the GitHub REST API. This is the "push" side; the static site (separate plan) is the "read" side.

## 2. Screens & Mobile UX Architecture

1. **Calendar View (Home & Primary Screen)**
   - **Integrated Month Header Card**: The month selector (`08/2026`), navigation arrows (`<`, `>`), `Today 🐾` button, search bar, and subject/type filter chips are attached directly to the top of the calendar card.
   - **Mobile Layout Order**: The main calendar view comes **FIRST** at the very top on mobile viewports for instant access.
   - **Ultra-Compact Micro Stats Bar**: Below the calendar grid sits a 4-column micro-strip displaying counts for *Total Quests*, *Exams ⚔️*, *Assignments 📜*, and *Pending Tasks 🐈*.
   - **Prominent Primary Action**: The `+ Add Quest` button spans full-width (`100%`) on mobile for easy one-tap access.
   - Days with events display color-coded pill indicators matching category types (`exam`, `assignment`, `class`, `personal`).
   - Tap any date → opens Day Detail Modal.

2. **Day Detail Modal**
   - Displays all scheduled events for the selected date in `DD/MM/YYYY` presentation format.
   - Includes a quick `+ Add Quest` header button.
   - **Instant UI Deletion**: Deleting a custom event immediately updates and re-renders the open day detail list in real-time.

3. **Add/Edit Event Screen**
   - Fields: Title (text), Date (native graphical date picker displaying `DD/MM/YYYY`), Time (optional time picker), Type (dropdown: exam / assignment / class / personal), Subject (CSE Gamma subjects: `CSET301`, `CS202`, `MATH301`, `AI402`, `NETWORKS`, `WEBDEV`, `OS303`, `DAA201`, `DBMS202`, `CYBER401`, or "None"), Description (multiline notes).
   - **"No due date yet" toggle** — when active, disables date selection and saves `date: null` for pending tasks announced without fixed deadlines.
   - Save → updates local state and syncs to `events.json` via GitHub API.

4. **All Events & Undated List**
   - Chronological agenda list with pull-to-refresh.
   - Pinned **"Pending & Undated Tasks 🐾"** section for events with `date: null`.
   - Dynamic subject filter chips (`ALL`, `CSET301`, `CS202`, etc.) and type filter chips (`Exam ⚔️`, `Assignment 📜`, `Class 🐾`, `Personal 🍃`).

5. **Settings & Themes**
   - GitHub Personal Access Token input (fine-grained, repo-scoped `contents:write`).
   - Repository config (`owner/repo/branch`).
   - **Neko Theme Accent Picker**: Toggle between `Cyan` (#58A6FF), `Crimson` (#E63946), `Purple` (#A855F7), and `Emerald` (#10B981) accent glow colors.
   - **Stationary Tenor Dancing Cat Mascot (`neko.gif`)**: Decorative mascot banner with generous headroom and isolated touch controls so navigation buttons are never obstructed.

## 3. Packages

| Package | Purpose |
|---|---|
| `http` | GitHub REST API calls |
| `flutter_secure_storage` | Secure PAT storage on-device |
| `table_calendar` | Calendar grid widget matching web cell ratios |
| `uuid` | Generate unique event IDs (`e1`, `e2`, ...) |
| `intl` | Date formatting (`YYYY-MM-DD` storage, `DD/MM/YYYY` display) |
| `provider` or `riverpod` | State management and instant real-time DOM/UI re-renders |

## 4. Data Model (Dart)

```dart
class ClassEvent {
  final String id;
  final String title;
  final String? date;       // YYYY-MM-DD (ISO), or null for undated tasks
  final String? time;       // HH:MM or null
  final String type;        // exam | assignment | class | personal
  final String? subject;    // e.g. "CSET301", "MATH301", or null
  final String description;

  bool get hasDate => date != null;

  ClassEvent({
    required this.id,
    required this.title,
    this.date,
    this.time,
    required this.type,
    this.subject,
    required this.description,
  });

  factory ClassEvent.fromJson(Map<String, dynamic> json) => ...
  Map<String, dynamic> toJson() => ...
}
```

Mirrors the web schema exactly. `date: null` represents pending/undated tasks. Presentation layer formats dates as `DD/MM/YYYY`.

## 5. GitHub Sync Logic

GitHub's Contents API requires the file's current SHA to update it:

**Flow for every save:**
1. `GET /repos/{owner}/{repo}/contents/events.json` → returns base64 content + `sha`
2. Decode base64 → parse JSON array → decode into `List<ClassEvent>`
3. Apply local change (add/edit/delete by `id`)
4. Re-encode array → base64
5. `PUT /repos/{owner}/{repo}/contents/events.json` with `{ message, content, sha, branch }`
6. If GitHub returns 409 (SHA mismatch) → re-fetch, re-apply, and retry once

**Auth:** `Authorization: Bearer <PAT>` header. Scoped to `contents:write` on `csegamma_Calendar`.

## 6. Offline Handling & Instant Feedback
- Maintain a local queue of unsynced mutations
- On save/delete while offline: apply optimistically to local UI state immediately, mark as "pending sync"
- On reconnect: process queue sequentially using the SHA-based GitHub API flow
- Show sync status indicator (synced / pending / error)

## 7. Testing Checklist
- [ ] Add event → updates `events.json` in GitHub repo within seconds
- [ ] Delete event → instant real-time removal from open day detail modal and grid
- [ ] Edit event → correct entry updated by `id` without duplication
- [ ] Date picker widget displays date as `DD/MM/YYYY` while storing `YYYY-MM-DD`
- [ ] Calendar grid comes first on mobile screen with attached month control header bar
- [ ] Prominent `+ Add Quest` button spans full-width on mobile
- [ ] Dancing cat mascot (`neko.gif`) stays stationary with ample headroom and never blocks `#today-btn`
- [ ] 100+ sample events load seamlessly without layout overflow
- [ ] Undated tasks (`date: null`) display under "Pending & Undated Tasks" section
- [ ] Accent color picker updates UI theme color (`Cyan`, `Crimson`, `Purple`, `Emerald`)

## 8. Build Order
1. Local-only Flutter prototype: grid, day detail modal, instant deletion, add quest form
2. Wire up GET (`events.json` fetch from GitHub repo)
3. Wire up PUT (add/edit/delete sync)
4. Add SHA conflict retry and offline queue
5. Polish: attached month header UI, accent color picker, stationary dancing cat mascot, compact mobile stats bar

## 9. Distribution
- Android: sideload APK build
- iOS: TestFlight or local Xcode build
