# Release checklist — The Chrono-Splinter

Playable game lives on **`master`**. itch.io HTML5 is the primary public build.

## Before you ship

1. **Bump version** in `js/constants.js` (`GAME.VERSION`).
2. **Cache-bust assets** — update every `?v=` query string in `index.html` to match the new version.
3. **Smoke test locally** — `start_server.bat`, hard-refresh, confirm bottom-right shows the new version.
4. **Mobile check** (optional but recommended) — DevTools device mode or a phone: HUD, pause menu, shop, chapter complete, boss label.

## Build

```bat
build_release.bat
```

This creates a clean `release/` folder (`index.html`, `css/`, `js/`, `assets/` only). Do not copy into an existing `release/` folder by hand.

Verify the build:

```powershell
Select-String VERSION release\js\constants.js
(Get-ChildItem release -Recurse -File).Count   # expect ~56 files, not 100+
```

## GitHub

```bat
git add js/constants.js index.html …
git commit -m "fix(ui): … Bump to X.Y.Z."
git push origin master
git tag vX.Y.Z -m "Release X.Y.Z: …"
git push origin vX.Y.Z
```

## itch.io (Butler)

```bat
butler push release pfaustino/chrono-splinter:html5 --userversion X.Y.Z
butler status pfaustino/chrono-splinter:html5
```

Butler uploads a new build; it does **not** always retire older uploads in the dashboard.

### itch dashboard (required)

1. Open [chrono-splinter on itch.io](https://pfaustino.itch.io/chrono-splinter) → **Edit game** → **Uploads**.
2. Enable **This file will be played in the browser** on the **newest** upload only.
3. **Delete or disable** older HTML5 uploads so players cannot hit a stale build.
4. Save and open the public page in a private/incognito window; hard-refresh if needed.

If players still see an old version string (e.g. `v0.9.5.x`), the wrong upload is active or the browser cache needs a hard refresh (Ctrl+Shift+R).

## Quick reference

| Step              | Where                          |
|-------------------|--------------------------------|
| Version source    | `js/constants.js` → `VERSION`  |
| Cache bust        | `index.html` → `?v=` on css/js   |
| Local test        | `start_server.bat` → port 8080   |
| Build output      | `release/`                       |
| Butler channel    | `pfaustino/chrono-splinter:html5` |
| Play URL          | https://pfaustino.itch.io/chrono-splinter |
