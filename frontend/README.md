# Dosimetry Data Hub

## Project info

A comprehensive platform for managing radiotherapy experiments and dosimetry data collection.

## Setup

### Requirements

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Python 3.11+ for the backend

### Getting Started

**Frontend:**
```sh
npm install
npm run dev
```

**Backend:**
```sh
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The frontend will be available at http://localhost:8080 and the backend API at http://localhost:8000

## Development

Use your preferred IDE (VS Code, PyCharm, etc.) to edit files. The development servers support hot-reloading for instant feedback.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

The application can be deployed to any platform supporting Node.js and Python:

- **Frontend**: Deploy to Vercel, Netlify, GitHub Pages, or any static host
- **Backend**: Deploy to Heroku, AWS, Azure, or any Python-capable server

Ensure environment variables are properly configured for your deployment target.
