# David's Mark Park - Full Stack Project

This project is structured with separate frontend and backend folders.

## Folder Structure

```
├── frontend/          # React + Vite frontend application
│   ├── src/          # React components and styles
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── vite.config.js
│
└── backend/          # Express.js backend API
    ├── routes/       # API routes
    ├── controllers/  # Route handlers
    ├── models/       # Data models (MongoDB)
    ├── middleware/   # Custom middleware
    ├── server.js     # Main server file
    ├── package.json  # Backend dependencies
    └── .env          # Environment variables
```

## Getting Started

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

## Dependencies

### Frontend
- React 19.2.5
- Vite 8.0.10
- ESLint

### Backend
- Express 4.18.2
- Mongoose 8.0.0
- CORS
- Dotenv
- Axios
- Nodemon (dev)

## Notes
- Frontend runs on `http://localhost:5173` (Vite default)
- Backend runs on `http://localhost:5000`
- Ensure CORS is properly configured for frontend-backend communication
