# CKY_MEPF - Engineering Calculation Suite

A high-precision, production-grade Mechanical, Electrical, Plumbing & Fire Protection (MEPF) calculation platform for building services engineering design.

[![Ventilation Verification CI](https://github.com/actions/workflows/ventilation-verification.yml/badge.svg)](https://github.com/actions/workflows/ventilation-verification.yml)
[![Deploy to GitHub Pages](https://github.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/actions/workflows/deploy.yml)

---

## 🛠 Features & Engineering Modules

- **Mechanical Ventilation (ASHRAE 62.1-2022 + Addendum j)**
  - Analytical and Simplified Multi-Zone Calculation Procedures
  - Air-density correction factors ($E_\rho$) for elevated and extreme temperature sites
  - Prescriptive Table 6-2 & 6-3 exhaust air rates and air classification
- **Cooling Load & Psychrometric Analysis**
  - Instant heat gain sensitivity slider with real-time chiller tonnage feedback
  - ASHRAE 90.1 envelope design range validation & threshold alerts
- **Hydronics & Duct Sizing**
  - Equal friction and static regain sizing methods with velocity limits
  - Pipe head loss, Reynolds number, and Darcy-Weisbach friction factor calculations
- **Electrical & Plumbing**
  - Voltage drop, conduit sizing, and fault current estimates
  - Water supply fixture units (WSFU) and drainage fixture units (DFU)
- **Universal Engineering Tools**
  - Comprehensive Batch Unit Converter (Metric ↔ Imperial across all MEP disciplines)
  - PDF & CSV calculation report export with clean, ink-friendly print layouts
  - Progressive Web App (PWA) offline support

---

## 🚀 Getting Started

### Prerequisites

- Node.js `20.x` or `22.x`
- npm `10.x` or later

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/CKY_MEPF.git
cd CKY_MEPF

# Install dependencies cleanly
npm ci
```

### Development Server

```bash
npm run dev
```

Open `http://localhost:3000` to view the interactive suite.

### Running Tests

```bash
# Run Vitest verification suite
npm test
```

### Type Checking & Linting

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

The production output will be generated inside the `dist/` directory.

---

## 🌐 Deploying to GitHub Pages

This repository includes a pre-configured GitHub Actions workflow for zero-config deployments:

1. Push this repository to GitHub on branch `main`.
2. Go to **Settings** > **Pages** in your GitHub repository.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The `.github/workflows/deploy.yml` workflow will automatically build and publish the site.
5. If deploying under a specific base path or custom domain, configure `BASE_URL` or use relative asset paths (default is `./` which works on any path).

---

## 📜 Standards & Compliance

- **ANSI/ASHRAE Standard 62.1-2022** (Ventilation for Acceptable Indoor Air Quality)
- **ASHRAE Standard 90.1** (Energy Standard for Buildings)
- **NFPA 13 & 14** (Installation of Sprinkler Systems & Standpipes)
- **IPC / UPC** (Uniform Plumbing Code)

---

## 📄 License

Proprietary engineering suite developed for construction project MEPF design.
