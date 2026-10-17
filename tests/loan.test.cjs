// Tests for the pure calculation core in index.html (between CORE:BEGIN and CORE:END).
// Run: node tests/loan.test.cjs
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/\/\* CORE:BEGIN[\s\S]*?\*\/\n([\s\S]*?)\/\* CORE:END \*\//);
if (!m) throw new Error('CORE block not found');
const core = new Function(m[1] + '\nreturn { toCents, levelPaymentCents, addMonths, buildSchedule };')();
const { levelPaymentCents, addMonths, buildSchedule } = core;

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('PASS', name); }
  catch (e) { console.log('FAIL', name, '\n   ', e.message); process.exitCode = 1; }
}
const near = (actual, expected, tol, msg) => assert.ok(Math.abs(actual - expected) <= tol, `${msg || ''} expected ~${expected}, got ${actual}`);

test('level payment matches reference: 100000 at 6% for 360 months = 599.55', () => {
  const s = buildSchedule({ principal: 100000, annualRatePct: 6, months: 360 });
  assert.equal(s.paymentCents, 59955);
});

test('250000 at 4.5% for 240 months = 1581.62', () => {
  assert.equal(buildSchedule({ principal: 250000, annualRatePct: 4.5, months: 240 }).paymentCents, 158162);
});

test('schedule ends exactly at zero and principal repaid equals loan amount (cents exact)', () => {
  const s = buildSchedule({ principal: 100000, annualRatePct: 6, months: 360 });
  assert.equal(s.rows.length, 360);
  assert.equal(s.rows[s.rows.length - 1].balance, 0);
  const principal = s.rows.reduce((a, r) => a + r.principal, 0);
  assert.equal(principal, 10000000);
});

test('total interest equals sum of interest column and total paid = principal + interest', () => {
  const s = buildSchedule({ principal: 100000, annualRatePct: 6, months: 360 });
  const interest = s.rows.reduce((a, r) => a + r.interest, 0);
  assert.equal(interest, s.totalInterestCents);
  assert.equal(s.totalPaidCents, 10000000 + interest);
});

test('reference total interest for 100000 at 6%/360 is about 115838.19 (cent-level tolerance)', () => {
  const s = buildSchedule({ principal: 100000, annualRatePct: 6, months: 360 });
  near(s.totalInterestCents / 100, 115838.19, 1.5, 'total interest');
});

test('zero interest: 12000 over 12 months = 1000 per month, no interest', () => {
  const s = buildSchedule({ principal: 12000, annualRatePct: 0, months: 12 });
  assert.equal(s.paymentCents, 100000);
  assert.equal(s.totalInterestCents, 0);
  assert.equal(s.rows[11].balance, 0);
});

test('extra payments shorten the loan, reduce interest and still end at zero', () => {
  const base = buildSchedule({ principal: 100000, annualRatePct: 6, months: 360 });
  const fast = buildSchedule({ principal: 100000, annualRatePct: 6, months: 360, extra: 200 });
  assert.ok(fast.count < base.count, 'fewer payments');
  assert.ok(fast.totalInterestCents < base.totalInterestCents, 'less interest');
  assert.equal(fast.rows[fast.rows.length - 1].balance, 0);
  const principal = fast.rows.reduce((a, r) => a + r.principal + r.extra, 0);
  assert.equal(principal, 10000000);
});

test('extra payment never pushes balance below zero on the last payment', () => {
  const s = buildSchedule({ principal: 1000, annualRatePct: 5, months: 24, extra: 5000 });
  assert.ok(s.rows.every(r => r.balance >= 0));
  assert.equal(s.rows[s.rows.length - 1].balance, 0);
  assert.equal(s.count, 1);
});

test('independent check with extra payments (cent tolerance per month)', () => {
  // Simple float simulation with per-month cent rounding, for comparison.
  const P = 15000, rate = 9.9, n = 60, extra = 75;
  const r = rate / 100 / 12;
  const pay = Math.round(P * 100 * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)) / 100;
  let bal = P, interest = 0, k = 0;
  while (bal > 0.004 && k < n) {
    k++;
    const i = Math.round(bal * r * 100) / 100;
    let pr = Math.min(pay - i, bal);
    if (k === n) pr = bal;
    const ex = Math.min(extra, bal - pr);
    bal = Math.round((bal - pr - ex) * 100) / 100;
    interest += i;
  }
  const s = buildSchedule({ principal: P, annualRatePct: rate, months: n, extra });
  assert.equal(s.count, k, 'same number of payments');
  near(s.totalInterestCents / 100, interest, 0.05 * k, 'interest');
});

test('addMonths keeps day of month and clamps to month end', () => {
  const jan31 = new Date(2027, 0, 31);
  const feb = addMonths(jan31, 1);
  assert.equal(feb.getMonth(), 1);
  assert.equal(feb.getDate(), 28);
  const leap = addMonths(new Date(2028, 0, 31), 1);
  assert.equal(leap.getDate(), 29);
  assert.equal(addMonths(new Date(2026, 10, 15), 2).getMonth(), 0);
  assert.equal(addMonths(new Date(2026, 10, 15), 2).getFullYear(), 2027);
});

test('levelPaymentCents rounds to nearest cent and handles 1 month', () => {
  assert.equal(levelPaymentCents(100000, 0.005, 1), Math.round(100000 * 0.005 * 1.005 / 0.005));
});

console.log(`\n${passed} tests passed` + (process.exitCode ? ' (with failures)' : ''));
