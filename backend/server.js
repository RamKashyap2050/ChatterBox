require("dotenv").config();
const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");
const bodyParser = require("body-parser");
const http = require("http");

// Connect to the database
connectDB();
console.log(process.env.PORT);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://yourfrontend.com", // Adjust this to match your client's URL.
    credentials: true, // Allows cookies to be sent with requests.
  })
);
const server = http.createServer(app);

// Routes
app.use("/Users", require("./routes/UserRoutes"));
app.use("/Chats", require("./routes/chatRoomRoutes"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "../", "frontend", "build", "index.html")
    );
  });
} else {
  app.get("/", (req, res) => res.send("API is running..."));
}

// Socket.io setup
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust for your frontend host
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("joinRoom", ({ chatRoomId }) => {
    socket.join(chatRoomId);
    console.log(`User joined room: ${chatRoomId}`);
  });

  socket.on("sendMessage", async ({ chatRoomId, content, senderId }) => {
    console.log("Received chatRoomId:", chatRoomId, "senderId:", senderId);
    const Message = require("./models/messageModel");

    const message = new Message({
      content,
      chatRoom: chatRoomId,
      sender: senderId,
    });

    try {
      const savedMessage = await message.save();
      // Populate the sender data before sending the message to all clients
      const populatedMessage = await Message.findById(
        savedMessage._id
      ).populate("sender", "name email _id"); // Adjust according to what sender info you need

      io.to(chatRoomId).emit("newMessage", populatedMessage);
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// Start server
server.listen(process.env.PORT || 5001, () =>
  console.log(`Server is running on port ${process.env.PORT || 5001}`)
);
