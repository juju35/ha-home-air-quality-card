# Changelog

## 1.3.3

### Maintenance
- Neutral room name in the screenshot mock data; screenshots regenerated.

## 1.3.2

### Fixes
- Room values (CO₂ · temperature · humidity) wrap onto a second line instead of being cut off with an ellipsis, so humidity stays visible on narrow tiles; a value is never split.
- A single room tile (e.g. one alert) now spans the full card width instead of half of it.

## 1.3.1

### Maintenance
- Tooling only, no functional change: Biome linting, pre-commit and a Lint CI (duplication checks). Card source modernized (optional chaining, template literals), identical behavior.

## 1.3.0

### Changes
- More compact layout with the same information, like the other ha-* cards: 12 px card padding, 36 px header icon, 16 px name and 12 px subtitle, 11 px pills, tighter tiles and sections.
- Rooms in a two-column grid when the card is at least 370 px wide (one column below), 32 px room badges.

## 1.2.1

### Changes
- HACS now asks for Home Assistant 2024.8 or later, the version that brought the sections view the card supports; the README says so under **Prerequisites**.
- The light README screenshots are in English, the dark ones in French.

## 1.2.0

### Changes
- Header aligned with the other ha-* cards: an icon coloured by the worst room, the title in 18px with the summary underneath, the outdoor badges on the title row.
- Warning and critical colors fall back to Home Assistant's defaults (`#ffa600`, `#db4437`), like the other ha-* cards; badges, room tiles and the room list title use the shared sizes.

### Development
- The card source moves to `src/home-air-quality-card.js`; the built card is no longer committed in `dist/`: CI builds it on every push, and the release workflow builds it and attaches it to the release, which is where HACS downloads it from.
- Releases are published when `version` in `package.json` has no tag yet; merged-branch cleanup workflow.
- README: Prerequisites, Screenshots and Development sections.

## 1.1.1

### Development
- `npm run screenshots` renders the README screenshots with mock rooms. Nothing changes for users.

## 1.1.0

### Changes
- The room list folds like ha-carburants-france and ha-renault-card: the chevron points right when folded and down when unfolded, and a click anywhere else on the page folds the list back to its default (`expanded`).

## 1.0.1

### Changes
- Smaller title and icon, the size of a Home Assistant heading card.

## 1.0.0

First public release.

### What's new
- Air quality card: CO₂, temperature and humidity of every room, with the outdoor temperature and humidity as badges in the header.
- Summary line with the number of rooms with high CO₂ and the rooms with high humidity, or "All good".
- Rooms in alert listed first, the worst first, with a coloured icon, an alert badge and the value in alert highlighted; the icon blinks above the critical threshold.
- The other rooms in a collapsible list, sorted by CO₂.
- Tap a room to open its dashboard, or the sensor details.
- Rooms found automatically from the areas, with an icon picked from the area name; outdoor areas never raise an alert.
- Warning and critical thresholds for CO₂ and humidity, for the whole card or per room.
- Visual editor in the dashboard UI, labels in English and French.
- Light and dark theme compatible, installable via HACS.
