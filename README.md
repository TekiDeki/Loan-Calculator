<div align="center">

# 🏦 Loan & Amortization Calculator

### Monthly payment, total interest, payoff date and a full repayment schedule

A zero-dependency, single-file web app by [TekiDeki](https://github.com/TekiDeki). It runs entirely in your browser: no account, no tracking, no upload.

[![Live app](https://img.shields.io/badge/live%20app-open-success?style=flat-square)](https://tekideki.github.io/Loan-Calculator/)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue?style=flat-square)](LICENSE)
[![Support](https://img.shields.io/badge/support-buy%20me%20a%20coffee-ff5f5f?style=flat-square)](https://paypal.me/TekiDeki)

</div>

## Features

- Monthly payment for any amount, annual rate (0 to 100 %) and term (1 to 600 months, entered in years or months).
- Total interest, total repaid, total cost including one-time fees, final payment date and number of payments.
- Optional **extra monthly payment**: shows the interest saved and how many months sooner the loan ends.
- Full **repayment schedule** (number, date, payment, extra, principal, interest, remaining balance).
- Balance chart comparing your plan with the no-extra-payment plan.
- **CSV export** of the schedule and **copy summary** to the clipboard.
- Currencies: RSD, RON, EUR, USD (display only; no exchange rates).
- Languages: English, Română, Srpski (Latin), Српски (Cyrillic). Switch from the header or with `?lang=ro`, `?lang=sr-Latn`, `?lang=sr-Cyrl`.
- Light and dark theme, responsive layout, keyboard-accessible controls, installable and offline-ready PWA.

## How the numbers are calculated

- Monthly rate = annual rate ÷ 12. The level payment is the standard annuity formula, rounded to the cent.
- Each month: interest = remaining balance × monthly rate (rounded to the cent); principal = payment − interest.
- Extra payments are applied after the regular payment and reduce the balance immediately.
- The final payment absorbs rounding differences, so the balance ends at exactly zero.
- All money math uses integer cents, so totals reconcile exactly.
- Dates: the first payment falls one month after the start date. When a month is shorter, the payment date moves to the last day of that month.

## What it does not do

- It does **not** compute APR, insurance, taxes, variable-rate changes, grace periods, or early-repayment penalties.
- Banks may use other day-count conventions or rounding. Treat the output as an estimate and confirm the final schedule with your lender.

## Privacy

Loan amounts and schedules are never sent anywhere and are not saved. The only data kept on your device is your language, theme and currency choice (`localStorage` key `loan_preferences_v1`).

## Tests

```bash
node tests/loan.test.cjs
```

The tests load the calculation core from `index.html` and check the payment formula against reference values, exact cent reconciliation, zero-interest loans, extra payments, month-end date clamping and an independent simulation.

UI checks in Chromium (Playwright): default results, extra payments, invalid input message, CSV download, language and theme switching, unsupported `?lang=` falling back to English, no horizontal scroll at 390 px width, and no JavaScript errors.

## Languages

| Language | Link |
|---|---|
| English | [EN](https://tekideki.github.io/Loan-Calculator/) |
| Română | [RO](https://tekideki.github.io/Loan-Calculator/?lang=ro) |
| Srpski (Latin) | [SR](https://tekideki.github.io/Loan-Calculator/?lang=sr-Latn) |
| Српски (Cyrillic) | [СР](https://tekideki.github.io/Loan-Calculator/?lang=sr-Cyrl) |

## Files

- `index.html`: the whole app (markup, styles, translations, calculation core).
- `sw.js`, `manifest.json`, icons: offline shell and installation.
- `tests/loan.test.cjs`: calculation tests.

## License

Apache-2.0. See [LICENSE](LICENSE).
