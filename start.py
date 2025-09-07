#!/usr/bin/env python3
"""
Unified startup script for the Cashier Change project.

Features:
- Interactive session (default): prompts for payment and cost repeatedly
- One-shot calculation: pass --payment and --cost to print the breakdown once
- Version/help and friendly errors
"""

from __future__ import annotations

import argparse
import sys
from typing import Optional

from change_logic import format_change_output
from change_calc import cashier_session  # type: ignore


def run_oneshot(payment: float, cost: float) -> int:
    lines = format_change_output(payment, cost)
    for line in lines:
        print(line)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="cashier-change",
        description="Cashier Change - optimal change breakdown",
    )

    subparsers = parser.add_subparsers(dest="command")

    # interactive (default)
    p_interactive = subparsers.add_parser(
        "interactive", help="Run interactive cashier session (default)"
    )
    p_interactive.set_defaults(command="interactive")

    # oneshot calculation
    p_calc = subparsers.add_parser(
        "calc", help="Run one calculation and exit"
    )
    p_calc.add_argument("--payment", type=float, required=True, help="Payment amount, e.g., 20.00")
    p_calc.add_argument("--cost", type=float, required=True, help="Cost amount, e.g., 13.27")

    # root flags
    parser.add_argument(
        "-v", "--version", action="version", version="cashier-change 1.0.0"
    )

    return parser


def main(argv: Optional[list[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    # Default to interactive if no command is provided
    command = args.command or "interactive"

    if command == "interactive":
        print("=== Change Calculator ===")
        cashier_session()
        return 0

    if command == "calc":
        return run_oneshot(payment=args.payment, cost=args.cost)

    parser.print_help()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())

