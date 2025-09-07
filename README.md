# cashier-change
Cashier Change Python Script
## What does it do?
* Figures out the optimum change to provide during checkout
------
* Initial code added 01/16/2025

## Quickstart

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

## Project structure

- `change_logic.py`: Core denomination math and output formatting
- `change-calc.py`: Interactive loop and session handling
- `start.py`: Unified CLI entrypoint (interactive and calc modes)
- `run.sh`: Convenience launcher

## Notes

- Amounts are handled in cents to avoid floating-point errors.
- Interactive mode validates inputs and allows easy repeat runs.
