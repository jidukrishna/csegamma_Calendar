# 侍学課暦 Class Calendar — Peach Manga & Torii Edition (with Mini Cats 🐱)

## 1. Overview

**Class Calendar (侍学課暦)** is a mobile-responsive, zero-dependency static web application styled with a vibrant **Peach Manga & Samurai Torii** aesthetic, featuring adorable mini CSS cats (Neko 🐱) hanging out across the interface.

---

## 2. Aesthetic & Manga Theme Highlights

- **Visual Palette**: Warm Dark Espresso/Charcoal (`#1A1114`), Luscious Peach Pink (`#FF9EAA`, `#FF7E67`), Sunset Ochre Gold (`#FFB07C`), and Vermilion Torii Red (`#E63946`).
- **Manga Comic Graphics**:
  - **Custom Artwork**: High-resolution generated manga samurai hero banner illustration (`assets/manga_samurai_hero.png`) and traditional Japanese Torii Gate manga crest (`assets/manga_torii_icon.png`).
  - **Screentone Overlay**: CSS halftone radial dot background texture (`radial-gradient`).
  - **Panel Ink Borders & Shadows**: 2.5px solid dark ink borders with 4px offset drop-shadows (`box-shadow: 4px 4px 0px #120A0C`).
  - **Action Sound Effect Callouts**: Rotated comic action badges ("ズバッ! ZUBAT!").
- **Mini CSS Neko Cats (🐱)**:
  - Roof sitting cat with animated tail wagging (`neko-roof-cat`) on top of the hero header banner.
  - Peeking cat (`ฅ^•ﻌ•^ฅ`) sitting over the search bar.
  - Sleeping cat (`🐾 ฅ(≚ᄌ≚)ฅ zzz...`) resting on the calendar grid top corner.
  - Paws hanging cat (`ฅ(≈>⩊<≈)ฅ`) dangling from the Undated Tasks panel.
  - Paw prints (`🐾`) appearing on calendar day cell hover.
- **Mobile First Design**:
  - Bottom sheet drawer for day detail modal on mobile devices.
  - Touch-scrollable filter chips bar with smooth inertia scrolling.
  - Compact day cell indicator pills and 1-tap view switcher to mobile vertical agenda list.

---

## 3. Directory Structure

Inside the `web/` directory:

```text
web/
├── index.html                  # Semantic markup with Manga Samurai hero header & mini cats
├── style.css                   # Peach Manga theme tokens, screentone patterns, ink borders & responsive rules
├── app.js                      # Calendar engine, falling peach petals & sparkles, modal drawer
├── events.json                 # Class events dataset
├── DOCS.md                     # Technical documentation & guide (this file)
├── website-implementation-plan.md # Architectural specification
└── assets/                     # Generated artwork assets
    ├── manga_samurai_hero.png  # Hero banner artwork (samurai warrior, Torii gate, peach blossoms)
    └── manga_torii_icon.png    # Manga Torii gate emblem icon
```

---

## 4. Data Schema (`events.json`)

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

---

## 5. Mobile Responsiveness Features

1. **Touch-Friendly Controls**: Touch targets minimum 44px for buttons, chips, and day cells.
2. **Horizontal Filter Scroll**: Subjects & types bar auto-scrolls horizontally on touch devices without messy multi-line wrapping.
3. **Mobile Drawer Modal**: Slide-up bottom sheet on mobile screens for date details.
4. **List View Switcher**: 1-tap toggle to vertical agenda stream optimized for 1-handed mobile scrolling.

---

## 6. GitHub Pages Deployment

To deploy to GitHub Pages:

```bash
git add web/
git commit -m "Deploy Peach Manga Samurai Calendar with Mini Cats"
git push origin main
```
Configure repository Settings -> Pages -> Source: `/web` (or root `/`).
