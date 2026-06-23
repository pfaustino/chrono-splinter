# Chrono Splinter — Architecture (full scope)

**Status:** Concept / pre-production. Lore and license only — no engine or gameplay code yet.

## Vision

Sci-fi timeline strategy: *The Continuance* fractures spacetime to invade 2087 and strip-mine the solar system (Mercury outward).

## Current repository contents

| Asset | Purpose |
|-------|---------|
| `README.md` | Lore pitch |
| `LICENSE` | GPL-3.0 |
| `ARCHITECTURE.md` | This document |
| `docs/adr/` | Planned technical decisions |

## Planned architecture (when started)

Decision needed before scaffolding:

| Option | Fit |
|--------|-----|
| Vite + Three.js | Matches GigaZonk / solar-system-trader stack |
| Godot 4 | RTS/strategy tooling |
| Unity WebGL | Heavy 4X tooling |

### Proposed module map (draft)

```
Game orchestrator
 ├── Timeline / era state
 ├── Solar system map (bodies, routes)
 ├── Faction AI (Continuance vs resistance)
 ├── Economy / mining simulation
 ├── Combat or abstract conflict resolution
 └── Narrative / mission system
```

## Next steps

1. ADR-0001: Engine choice  
2. ADR-0002: Real-time vs turn-based loop  
3. Minimal playable vertical slice (one planet, one resource loop)  
4. CI + `ARCHITECTURE.md` update with real module paths  

## Docs

`docs/adr/README.md` — decision log starts here.
