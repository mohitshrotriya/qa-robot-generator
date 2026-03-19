cat > ~/qa-robot-generator/README.md << 'EOF'
# QAMS QA Robot

> AI-Powered Robot Framework Test Case Generator

Developed by **Mohit Shrotriya** — QAMS AI Testing Tool

![License](https://img.shields.io/badge/License-MIT-green)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-blue)
![Framework](https://img.shields.io/badge/Robot%20Framework-Browser%20Library-red)

## Features

- Multi-project & multi-page management
- HTML paste for auto element extraction
- Screenshot upload for better AI accuracy
- Generates Happy Path, Positive & Negative test cases
- Exports .robot, XML, CSV, GitHub Actions YAML
- Headless / Headed browser toggle
- Backup & Restore projects

## Quick Start
```bash
git clone https://github.com/mohitshrotriya/qa-robot-generator.git
cd qa-robot-generator
npm install
npm run dev
```

Get free Gemini API key from **aistudio.google.com**

## Tech Stack

- React + Vite
- Google Gemini 2.5 Flash (Free)
- Robot Framework + Browser Library

## License

MIT
EOF

git add README.md
git commit -m "docs: Add professional README"
git push



# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
