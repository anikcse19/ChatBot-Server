const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const server = http.createServer(app);

const io = socketIo(server, { cors: { origin: "*" } });

// ✅ Attach io to app so controllers can access it
app.set("io", io);

const botRoutes = require("./routes/botRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5500",
    ],
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Increase URL-encoded limit

app.use(express.static("public"));
// API Routes
app.use("/api/bot", botRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/conversation", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

const users = new Map(); // sessionId -> socket.id

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (sessionId) => {
    socket.join(sessionId);
    users.set(sessionId, socket.id);
    console.log(`Session ${sessionId} joined room`);
  });

  socket.on("disconnect", () => {
    for (const [sid, sockId] of users.entries()) {
      if (sockId === socket.id) {
        users.delete(sid);
        break;
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // ✅ Needed so controller can access req.app
