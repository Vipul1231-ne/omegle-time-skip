# Omegle Time-Skip

A Tampermonkey userscript that automatically skips strangers on ome.tv after a set time limit. Includes a live HUD overlay with countdown timer, skip counter, and manual controls.

## Features

- Auto-skip after configurable time (default 30s)
- Live countdown HUD in bottom-right corner
- Warning colour when time is running low
- Manual skip button
- Auto/manual mode toggle
- Session skip counter
- Persists settings across page reloads

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for Chrome or Firefox
2. Click [here](https://github.com/Vipul1231-ne/omegle-time-skip/raw/refs/heads/main/Omegle%20Time-Skip%20Automation-1.0.0.user.js) to install the script
3. Open ome.tv — the HUD appears automatically

## Config

Edit the CFG block at the top of the script:

| Setting | Default | Description |
|---|---|---|
| skipAfter | 30 | Seconds before auto-skip |
| warnAt | 10 | Seconds left when HUD turns orange |
| skipDelay | 1.0 | Pause after skip before next timer starts |
| autoMode | true | false = timer only, no auto-skip |

## Usage

- HUD appears bottom-right on ome.tv
- Timer starts automatically when a stranger connects
- Press Skip now to skip manually at any time
- Toggle Auto ON/OFF to switch modes
