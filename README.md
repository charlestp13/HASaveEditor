# Hollywood Animal Save Editor

<img width="1306" height="1058" alt="image" src="https://github.com/user-attachments/assets/cbc6d7c5-172f-41be-86e0-21f1c0a3f3ef" />


## What It Does

Edit character stats, statuses, traits, and genres across all professions (actors, directors, writers, etc.).

## Features

- **Edit**: Name, Happiness, Loyalty, Skill, Limit, Traits, Genres
- **Edit (Actors/Directors)**: Public Image (ART/COM)
- **Edit (Cinematographers)**: Setting Specialty (INDOOR/OUTDOOR)
- **Filter**: Studio, Gender, Dead/Locked, Shady status
- **Sort**: Skill, Self-Esteem, Age, Artistic Value, Commercial Value

## Installation

1. Download the latest release
2. Run the executable
3. Point it to your Hollywood Animal install folder (first time only)

## Usage

Unofficial tool - backup your saves!

Click "Open Save File" → Browse characters by profession → Edit stats → Click "Save" when done.

## Tech Stack

React + TypeScript + Tailwind CSS + Tauri

## Development

```bash
npm install
npm run tauri dev      # Dev mode
npm run tauri build    # Production build
```

## Troubleshooting

**Game path not found?** Click "Browse for Game Folder" and select your Hollywood Animal installation.

**Names showing as IDs?** Check your game path is correct.

**Changes not saving?** Make sure you clicked "Save" and the file isn't open elsewhere.

---

Made for the Hollywood Animal community. Unofficial tool - backup your saves! 🎬
