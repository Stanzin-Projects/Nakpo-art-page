# Lopsang Rinchen Art Page

A personal art portfolio site built with **React + Tailwind CSS** (frontend) and **Node.js + MongoDB** (backend).

## What's included

- **Frontend** (`frontend/`): React 18, Vite, Tailwind CSS, React Router  
  - Home, Gallery, About, Contact  
  - Artwork detail page, contact form  
- **Backend** (`backend/`): Express, Mongoose, Multer  
  - REST API for artworks (CRUD) and contact messages  
  - MongoDB for data, local file uploads for images  

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally (e.g. `mongodb://localhost:27017`) or a cloud URI

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI if needed, PORT (default 4000), FRONTEND_URL (default http://localhost:5173)
npm install
npm run dev
```

Server runs at **http://localhost:4000**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**. API and `/uploads` are proxied to the backend.

### 3. Database

MongoDB database name: `lopsang-rinchen-art` (or whatever you set in `MONGO_URI`).  
Collections are created automatically when you add artworks or contact messages.

## Adding artworks

Use the API (e.g. Postman or a small admin UI later):

- **POST** `/api/artworks`  
  - Body: `title`, `description` (optional), `category` (optional), `year` (optional), `isFeatured` (optional)  
  - Form-data: `image` (file)  
- Or set `imageUrl` to an external URL in the body instead of uploading.

## Matching your Figma design

This project was generated from the name **LOPSANGRINGCHENARTPAGE**. The layout (hero, gallery, about, contact) is a standard art portfolio. Your Figma file could not be opened from here (login required).

To align with your Figma:

1. Share **screenshots** of each screen (Home, Gallery, About, Contact), or  
2. Export **code** from Figma (e.g. “Figma to Code” plugin) and put the ZIP in this repo.

Then we can adjust layout, typography, colors, and components to match. You can already change:

- **Colors**: `frontend/tailwind.config.js` → `theme.extend.colors` (e.g. `cream`, `ink`, `gold`, `stone`)  
- **Copy**: Edit text in `frontend/src/pages/*.jsx` and `About.jsx`  
- **Logo/favicon**: Replace `frontend/public/favicon.svg`  

## Scripts

| Where     | Command      | Description        |
|----------|--------------|--------------------|
| backend  | `npm run dev` | Run API with watch |
| backend  | `npm start`   | Run API            |
| frontend | `npm run dev` | Run dev server     |
| frontend | `npm run build` | Production build |

## Project structure

```
lopsang-rinchen-art/
├── backend/
│   ├── config/       # DB connection
│   ├── controllers/  # artwork, contact
│   ├── middleware/   # upload
│   ├── models/       # Artwork, Contact
│   ├── routes/       # API routes
│   ├── uploads/      # uploaded images (created at runtime)
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/      # axios + artwork, contact APIs
│   │   ├── components/ # Layout, Header, Footer, ArtCard
│   │   ├── pages/    # Home, Gallery, About, Contact, ArtworkDetail
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

To match your Figma design exactly, share screenshots or an export and we can refine the UI.
