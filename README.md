# chatapp-v2

A full-stack real-time chat application with a React (Vite + Tailwind CSS) frontend and an Express, MongoDB, and Socket.IO backend supporting chats, messages, stories, and media uploads.

## Run locally

### Backend

```
cd Backend
npm install
set MONGO_URI=<your-mongodb-uri>
node server.js
```

The backend runs on port 6000 by default (override with `PORT`).

### Frontend

```
cd Frontend
npm install
set VITE_BACKEND_URL=http://localhost:6000
npm run dev
```

The frontend dev server runs on the Vite default port.

## License

MIT
