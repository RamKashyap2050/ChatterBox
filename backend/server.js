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

connectDB();
console.log(process.env.PORT);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());
app.use(cookieParser());
// app.use(
//   cors({
//     origin: "https://yourfrontend.com", // Adjust this to match your client's URL.
//     credentials: true, // Allows cookies to be sent with requests.
//   })
// );


const allowedOrigins = ['https://chatter-box-inky.vercel.app', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request if no origin or if it's from an allowed origin
    } else {
      callback(new Error('Not allowed by CORS')); // Block the request if it's not from an allowed origin
    }
  },
  credentials: true
}));

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
  path: "/socket.io/",
  cors: {
    origin: ["https://chatter-box-inky.vercel.app", "http://localhost:3000"], // List all frontend URLs
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
      const populatedMessage = await Message.findById(
        savedMessage._id
      ).populate("sender", "name email _id"); 

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
