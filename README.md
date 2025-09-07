# cashier-change
Cashier Change Python Script

## Overview
Calculates the optimal change to return for a cash transaction and prints a clear, human-friendly breakdown of bills and coins. 💵

## Installation
- Ensure Python 3.8+ is installed
- Clone this repository
- (Optional) Make the launcher executable: `chmod +x run.sh`

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
- 2025-01-16 — v1.0.0: Initial release (interactive and calc modes; integer-cents arithmetic; `run.sh` launcher)
