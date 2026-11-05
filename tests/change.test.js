// Run with: node --test tests/change.test.js
// Checks the web app's change.js against the Python reference (change_logic.py).
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const CC = require("../docs/change.js");

const root = path.join(__dirname, "..");

function pythonBreakdown(pairs) {
  const script = `
import json, sys
from change_logic import calculate_change_breakdown
out = []
for p, c in json.load(sys.stdin):
    out.append([l.to_display() for l in calculate_change_breakdown(p / 100, c / 100)])
print(json.dumps(out))
`;
  const res = execFileSync("python3", ["-B", "-c", script], { cwd: root, input: JSON.stringify(pairs) });
  return JSON.parse(res.toString());
}

test("matches change_logic.py on 3,000 random transactions", () => {
  let seed = 42;
  const rand = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  const pairs = [];
  for (let i = 0; i < 3000; i++) {
    const cost = rand(50000);
    pairs.push([cost + rand(20000), cost]);
  }
  const py = pythonBreakdown(pairs);
  pairs.forEach(([pay, cost], i) => {
    const js = CC.breakdown(pay - cost).map((l) => `${l.count} ${l.name}`);
    assert.deepEqual(js, py[i], `payment=${pay} cost=${cost}`);
  });
});

test("parseCents never uses floats", () => {
  assert.equal(CC.parseCents("0.1"), 10);
  assert.equal(CC.parseCents("0.29"), 29);       // 0.29 * 100 = 28.999… in floats
  assert.equal(CC.parseCents("1.005"), 101);     // half-up on the third decimal
  assert.equal(CC.parseCents("1.004"), 100);
  assert.equal(CC.parseCents("$1,234.56"), 123456);
  assert.equal(CC.parseCents(" 20 "), 2000);
  assert.equal(CC.parseCents(".75"), 75);
  assert.equal(CC.parseCents("20."), 2000);
  assert.equal(CC.parseCents("007.5"), 750);
  assert.equal(CC.parseCents(""), null);
  assert.equal(CC.parseCents("   "), null);
  for (const bad of [".", "abc", "-5", "1.2.3", "1e3", "12a", "1000000.01"]) {
    assert.ok(Number.isNaN(CC.parseCents(bad)), bad);
  }
  assert.equal(CC.parseCents("1000000"), 100000000);
});

test("formatCents", () => {
  assert.equal(CC.formatCents(0), "$0.00");
  assert.equal(CC.formatCents(5), "$0.05");
  assert.equal(CC.formatCents(673), "$6.73");
  assert.equal(CC.formatCents(123456789), "$1,234,567.89");
});

test("calculate states", () => {
  assert.equal(CC.calculate("", "").status, "empty");
  assert.equal(CC.calculate("5", "").status, "empty");
  assert.deepEqual(CC.calculate("x", "y").invalid, ["due", "tendered"]);
  const s = CC.calculate("13.27", "10");
  assert.equal(s.status, "short");
  assert.equal(s.shortBy, 327);
  assert.equal(CC.calculate("13.27", "13.27").status, "exact");
  const c = CC.calculate("13.27", "20");
  assert.equal(c.status, "change");
  assert.equal(c.change, 673);
  assert.equal(c.bills, 2);
  assert.equal(c.coins, 7);
});

test("suggestTenders", () => {
  assert.deepEqual(CC.suggestTenders(1327), [1400, 1500, 2000, 5000, 10000]);
  assert.deepEqual(CC.suggestTenders(2000), [2500, 3000, 4000, 5000, 10000]);
  assert.deepEqual(CC.suggestTenders(0), []);
  assert.deepEqual(CC.suggestTenders(null), []);
  for (const v of CC.suggestTenders(9999)) assert.ok(v > 9999);
});
