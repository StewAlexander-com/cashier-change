from dataclasses import dataclass
from typing import Dict, List, Tuple


# Keep denominations in cents to avoid floating-point errors
DENOMINATIONS_CENTS: Dict[int, Tuple[str, str]] = {
    10000: ("hundred dollar bill", "hundred dollar bills"),
    5000: ("fifty dollar bill", "fifty dollar bills"),
    2000: ("twenty dollar bill", "twenty dollar bills"),
    1000: ("ten dollar bill", "ten dollar bills"),
    500: ("five dollar bill", "five dollar bills"),
    100: ("one dollar bill", "one dollar bills"),
    25: ("quarter", "quarters"),
    10: ("dime", "dimes"),
    5: ("nickel", "nickels"),
    1: ("penny", "pennies"),
}


@dataclass(frozen=True)
class ChangeLine:
    count: int
    singular_plural: Tuple[str, str]

    def to_display(self) -> str:
        name = self.singular_plural[0] if self.count == 1 else self.singular_plural[1]
        return f"{self.count} {name}"


def calculate_change_breakdown(payment_amount: float, cost: float) -> List[ChangeLine]:
    """Return optimal change breakdown as a list of ChangeLine objects.

    Uses integer cents for exact arithmetic. Rounds to the nearest cent for inputs.
    """
    payment_cents = int(round(payment_amount * 100))
    cost_cents = int(round(cost * 100))
    change_cents = payment_cents - cost_cents

    if change_cents < 0:
        # Negative change indicates insufficient payment
        return []

    breakdown: List[ChangeLine] = []

    for denom in sorted(DENOMINATIONS_CENTS.keys(), reverse=True):
        if change_cents <= 0:
            break
        if change_cents >= denom:
            count = change_cents // denom
            change_cents = change_cents % denom
            if count > 0:
                breakdown.append(ChangeLine(count=count, singular_plural=DENOMINATIONS_CENTS[denom]))

    return breakdown


def format_change_output(payment_amount: float, cost: float) -> List[str]:
    """Produce display lines for the change breakdown including header lines."""
    payment_cents = int(round(payment_amount * 100))
    cost_cents = int(round(cost * 100))
    change_cents = payment_cents - cost_cents

    lines: List[str] = []
    lines.append(f"\nPayment: ${payment_amount:.2f}")
    lines.append(f"Cost: ${cost:.2f}")
    lines.append(f"Change due: ${change_cents/100:.2f}")
    lines.append("\nOptimal change:")

    for line in calculate_change_breakdown(payment_amount, cost):
        lines.append(line.to_display())

    return lines

