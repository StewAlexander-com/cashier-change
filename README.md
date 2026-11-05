# cashier-change
Cashier Change Python Script

## Overview
Calculates the optimal change to return for a cash transaction and prints a clear, human-friendly breakdown of bills and coins. 💵

## Web app (PWA)
A browser version lives in [`docs/`](docs/) and is served by GitHub Pages:
**https://stewalexander-com.github.io/cashier-change/**

- Live results as you type, with one-tap common cash amounts ("Exact", next dollar, $20, …)
- Installable to your home screen and works fully offline
- Same integer-cents logic as the Python version, checked by a parity test
- Prefill with a link: `?due=13.27&tendered=20`

To publish: **Settings → Pages → Deploy from a branch → `main` / `/docs`**.

Run it locally:
```bash
cd docs && python3 -m http.server 8000   # then open http://localhost:8000
```

Tests (Node 18+ and Python 3):
```bash
node --test tests/change.test.js
```

## Installation
- Ensure Python 3.8+ is installed

Clone this repository (choose one):

HTTPS
```bash
git clone https://github.com/StewAlexander-com/cashier-change.git
cd cashier-change
```

SSH
```bash
git clone git@github.com:StewAlexander-com/cashier-change.git
cd cashier-change
```

Optional (macOS/Linux): make the launcher executable
```bash
chmod +x run.sh
```

Optional: create a virtual environment (no extra packages required)
```bash
python3 -m venv .venv
source .venv/bin/activate
```

No additional dependencies are required.

## Quick Start
Run interactively (recommended):

```bash
./run.sh
```

Or with Python directly:

```bash
python3 start.py
```

One-shot calculation:

```bash
./run.sh calc --payment 20.00 --cost 13.27
# or
python3 start.py calc --payment 20.00 --cost 13.27
```

Show version/help:

```bash
./run.sh --version
./run.sh --help
./run.sh calc --help
```

## Why
Point-of-sale workflows need fast, reliable, and minimal-change breakdowns. This tool:
- Uses integer cents to avoid floating-point rounding errors
- Produces an optimal, easy-to-read list with correct singular/plural names
- Supports both an interactive flow and a one-shot CLI for automation

## Updates
- 2026-11-05 — v2.0.0: Installable offline web app (PWA) in `docs/`; fixed the CLI failing to start (`change-calc.py` renamed to `change_calc.py`)
- 2025-01-16 — v1.0.0: Initial release (interactive and calc modes; integer-cents arithmetic; `run.sh` launcher)
