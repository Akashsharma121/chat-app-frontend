# Real-Time Chat App — Frontend

React frontend jo backend REST API aur Socket.io se connect hota hai.

## Tech Stack
- React (Create React App)
- React Router (routing)
- Axios (API calls)
- Socket.io-client (real-time events)
- Plain CSS (no framework — custom design system)

## Folder Structure
```
chat-app-frontend/
├── src/
│   ├── context/
│   │   ├── AuthContext.js     # Login/signup/logout state
│   │   └── SocketContext.js   # Socket.io connection + online users
│   ├── components/
│   │   ├── ProtectedRoute.js  # Redirects to /login if not authed
│   │   ├── Sidebar.js         # User list with search + online status
│   │   ├── ChatWindow.js      # Message thread + input + typing
│   │   └── MessageBubble.js   # Single message bubble
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   └── Chat.js            # Combines Sidebar + ChatWindow
│   ├── utils/
│   │   └── api.js             # Axios instance with auth header
│   ├── App.js                 # Routes
│   ├── App.css                # All app styling
│   └── index.js / index.css
└── .env                       # Create this (see below)
```

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
```bash
cp .env.example .env
```
Default values point to `http://localhost:5000` — change only if your backend runs elsewhere:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. Make sure the backend is running first
The frontend expects the backend (from the other folder) running on port 5000.

### 4. Run the app
```bash
npm start
```
Opens at `http://localhost:3000`

## How to test real-time chat (2 users)

1. Open the app in two different browser windows (or one normal + one incognito)
2. Sign up as **User A** in window 1
3. Sign up as **User B** in window 2
4. In window 1, click on User B from the sidebar and send a message
5. It should appear instantly in window 2 — that's Socket.io working
6. Try typing without sending — the other window shows a typing indicator

## Notes
- Auth token is stored in `localStorage` under `chatapp_token`
- Refreshing the page keeps you logged in (session persists)
- Logout clears local storage and disconnects the socket
