# 🐾 CSE Gamma Class Calendar — Neko Dark Academia Edition

## 1. Overview

**Class Calendar (CSE Gamma Edition)** is a modern, mobile-responsive, zero-dependency web application for CSE Gamma class schedules, exams, assignments, and personal quests. It features a sleek **Dark Academia / Neko** aesthetic with dynamic accent color selection, an animated **Tenor Dancing Cat Mascot (`neko.gif`)**, attached calendar header controls, and real-time custom task management.

---

## 2. Key Architecture & Aesthetic Features

- **Integrated Calendar Header Bar**:
  - The month display (`08/2026`), navigation controls (`<`, `>`, `Today 🐾`), search box, and category/subject filter chips are attached directly to the top of the main calendar card wrapper for a unified, modern card design.
- **Mobile-First Layout Priority**:
  - **Calendar Grid First**: The calendar view comes **FIRST** at the very top of mobile viewports for instant access.
  - **Ultra-Compact Micro Stats Bar**: Displays counts for *Total Quests*, *Exams ⚔️*, *Assignments 📜*, and *Pending Tasks 🐈* in a 4-column micro-strip below the calendar.
  - **Prominent `+ Add Quest` Button**: Full-width (`100%`) primary button on mobile for easy one-tap access.
- **Stationary Tenor Dancing Cat Mascot (`neko.gif`)**:
  - Positioned atop the app header with generous unblocked headroom (`padding-top: 3rem`) and click-through pointer isolation so control buttons underneath remain 100% accessible.
- **Interactive Theme Accent Color Picker**:
  - Instantly switch theme accent colors between `Cyan` (#58A6FF), `Crimson` (#E63946), `Purple` (#A855F7), and `Emerald` (#10B981) with dynamic CSS variables and ambient glow.
- **Custom Quest Management & Instant UI Deletion**:
  - Graphical date picker widget supporting `DD/MM/YYYY` display formatting.
  - Deleting custom quests from local storage instantly updates and re-renders open day detail modals in real-time.
  - "No due date yet" toggle support for pending tasks (`date: null`).

---

## 3. Repository Structure

```text
csgamma/
├── index.html                  # Semantic markup with integrated attached header & Neko mascot banner
├── style.css                   # Dark Academia tokens, glassmorphism, mobile flex reordering & theme accents
├── app.js                      # Calendar engine, filter logic, localStorage sync, instant modal re-rendering
├── events.json                 # 100+ CSE Gamma class events, exams, assignments & quests dataset
├── neko.gif                    # Tenor Dancing Cat mascot asset
├── DOCS.md                     # Technical documentation & guide (this file)
└── .gitignore                  # Git ignore rules
```

---

## 4. Data Schema (`events.json`)

```json
[
  {
    "id": "e1",
    "title": "Midterm Exam - CSET301",
    "date": "2026-08-20",
    "time": "10:00",
    "type": "exam",
    "subject": "CSET301",
    "description": "Chapters 1-5, Hall 204"
  },
  {
    "id": "e116",
    "title": "Final Project Prototype",
    "date": null,
    "time": null,
    "type": "assignment",
    "subject": "MATH301",
    "description": "Announced in class, due date TBD"
  }
]
```

---

## 5. Mobile Responsiveness Highlights

1. **Calendar First Order**: On screens under 768px, the calendar wrapper card takes top visual priority.
2. **Horizontal Filter Chip Carousel**: Subject & type filter chips scroll smoothly with touch inertia.
3. **Headroom & Pointer Protection**: Container padding ensures the mascot GIF is never clipped, while isolated pointer events prevent cat overlays from blocking the `#today-btn` or search input.
4. **Full-Width Touch Targets**: Action buttons stretch comfortably across mobile viewports for easy single-hand navigation.

---

## 6. GitHub Pages Deployment

To deploy updates to GitHub Pages:

```bash
git add .
git commit -m "Update CSE Gamma Calendar with mobile layout & attached controls"
git push origin main
```
Configure repository Settings -> Pages -> Source: `main` branch.
