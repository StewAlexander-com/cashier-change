/*
 * Cashier Change: core logic.
 * A port of change_logic.py. All math is done in integer cents, so floating
 * point never touches money.
 * Works as a browser global (window.CashierChange) and as a CommonJS module.
 */
(function (root) {
  "use strict";

  /** Largest amount accepted, in cents ($1,000,000.00). */
  var MAX_CENTS = 100000000;

  /** US denominations, largest first. Mirrors DENOMINATIONS_CENTS in change_logic.py. */
  var DENOMINATIONS = [
    { cents: 10000, kind: "bill", label: "$100", singular: "hundred dollar bill", plural: "hundred dollar bills" },
    { cents: 5000,  kind: "bill", label: "$50",  singular: "fifty dollar bill",   plural: "fifty dollar bills" },
    { cents: 2000,  kind: "bill", label: "$20",  singular: "twenty dollar bill",  plural: "twenty dollar bills" },
    { cents: 1000,  kind: "bill", label: "$10",  singular: "ten dollar bill",     plural: "ten dollar bills" },
    { cents: 500,   kind: "bill", label: "$5",   singular: "five dollar bill",    plural: "five dollar bills" },
    { cents: 100,   kind: "bill", label: "$1",   singular: "one dollar bill",     plural: "one dollar bills" },
    { cents: 25,    kind: "coin", label: "25¢",  singular: "quarter",             plural: "quarters" },
    { cents: 10,    kind: "coin", label: "10¢",  singular: "dime",                plural: "dimes" },
    { cents: 5,     kind: "coin", label: "5¢",   singular: "nickel",              plural: "nickels" },
    { cents: 1,     kind: "coin", label: "1¢",   singular: "penny",               plural: "pennies" }
  ];

  /**
   * Parse a typed money string into integer cents without using floats.
   * Accepts "20", "20.5", "$1,234.56", ".75". Extra decimals round half-up.
   * Returns null for empty input, NaN for anything invalid or out of range.
   */
  function parseCents(input) {
    var s = String(input == null ? "" : input).replace(/[\s$,]/g, "");
    if (s === "") return null;
    var m = /^(\d*)(?:\.(\d*))?$/.exec(s);
    if (!m || (m[1] === "" && (m[2] === undefined || m[2] === ""))) return NaN;
    var whole = m[1] === "" ? 0 : parseInt(m[1].replace(/^0+(?=\d)/, ""), 10);
    var frac = (m[2] || "") + "000";
    var cents = whole * 100 + parseInt(frac.slice(0, 2), 10);
    if (parseInt(frac.charAt(2), 10) >= 5) cents += 1;
    if (!isFinite(cents) || cents > MAX_CENTS) return NaN;
    return cents;
  }

  /** Format integer cents as "$1,234.56". */
  function formatCents(cents) {
    var neg = cents < 0;
    var abs = Math.abs(cents);
    var dollars = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var rem = String(abs % 100);
    if (rem.length < 2) rem = "0" + rem;
    return (neg ? "-$" : "$") + dollars + "." + rem;
  }

  /** Greedy breakdown. US currency is canonical, so greedy gives the fewest pieces. */
  function breakdown(changeCents) {
    var lines = [];
    var left = changeCents;
    for (var i = 0; i < DENOMINATIONS.length && left > 0; i++) {
      var d = DENOMINATIONS[i];
      var count = Math.floor(left / d.cents);
      if (count > 0) {
        left -= count * d.cents;
        lines.push({
          denomination: d,
          count: count,
          name: count === 1 ? d.singular : d.plural,
          subtotal: count * d.cents
        });
      }
    }
    return lines;
  }

  /**
   * Work out a whole transaction.
   * status: "empty" | "invalid" | "short" | "exact" | "change"
   */
  function calculate(dueInput, tenderedInput) {
    var due = parseCents(dueInput);
    var tendered = parseCents(tenderedInput);
    var invalid = [];
    if (due !== null && isNaN(due)) invalid.push("due");
    if (tendered !== null && isNaN(tendered)) invalid.push("tendered");
    if (invalid.length) return { status: "invalid", invalid: invalid };
    if (due === null || tendered === null) return { status: "empty", due: due, tendered: tendered };

    var diff = tendered - due;
    if (diff < 0) return { status: "short", due: due, tendered: tendered, shortBy: -diff };
    if (diff === 0) return { status: "exact", due: due, tendered: tendered, change: 0, lines: [] };

    var lines = breakdown(diff);
    var bills = 0, coins = 0;
    lines.forEach(function (l) {
      if (l.denomination.kind === "bill") bills += l.count; else coins += l.count;
    });
    return { status: "change", due: due, tendered: tendered, change: diff, lines: lines, bills: bills, coins: coins };
  }

  /**
   * Common cash amounts a customer is likely to hand over for a given total:
   * the next whole dollar, then the next $5, $10, $20, $50 and $100 steps.
   */
  function suggestTenders(dueCents) {
    if (!(dueCents > 0)) return [];
    var steps = [100, 500, 1000, 2000, 5000, 10000];
    var out = [];
    steps.forEach(function (step) {
      var v = Math.ceil(dueCents / step) * step;
      if (v === dueCents) v += step === 100 ? 0 : step;
      if (v > dueCents && out.indexOf(v) === -1 && v <= MAX_CENTS) out.push(v);
    });
    out.sort(function (a, b) { return a - b; });
    return out.slice(0, 5);
  }

  var api = {
    MAX_CENTS: MAX_CENTS,
    DENOMINATIONS: DENOMINATIONS,
    parseCents: parseCents,
    formatCents: formatCents,
    breakdown: breakdown,
    calculate: calculate,
    suggestTenders: suggestTenders
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CashierChange = api;
})(typeof self !== "undefined" ? self : this);
