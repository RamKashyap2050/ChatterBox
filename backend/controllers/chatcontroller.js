const asynchandler = require("express-async-handler");
const chatroom = require("../models/chatRoom");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const messages = require("../models/messageModel");
const users = require("../models/usermodel");



const createchatroom = asynchandler(async (req, res) => {
  // const { name, userIds } = req.body;
  // console.log("Received User IDs:", userIds); // Debug to see what's being received
  // try {
  //   const newRoom = await chatroom.create({ name : name, participants : userIds });
  //   res.status(201).json(newRoom);
  // } catch (error) {
  //   res
  //     .status(400)
  //     .json({ message: "Failed to create chat room", error: error.message });
  // }

  const { userIds } = req.body; // Expecting an array of two user IDs
  console.log(userIds);
  const sortedUserIds = userIds.sort();

  try {
    let chat = await chatroom.findOne({
      participants: { $all: sortedUserIds },
    });
    console.log;

    if (!chat) {
      chat = new chatroom({
        participants: sortedUserIds,
      });
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({
      message: "Failed to find or create chat room",
      error: error.message,
    });
  }
});

const getchats = asynchandler(async (req, res) => {
  try {
    const chathistory = await messages
      .find({ chatRoom: req.params.chatRoomId })
      .populate("sender");
    res.json(chathistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const deleteChats = asynchandler(async (req, res) => {
  const { chatRoomId } = req.params;
  console.log("Chat Room ID", chatRoomId);
  try {
    // Delete all messages associated with the chat room
    await messages.deleteMany({ chatRoom: chatRoomId });

    await chatroom.findByIdAndDelete(chatRoomId);

    res.status(200).json({
      message: "Chat room and all associated messages deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete chat room", error: error });
  }
});

const getlastmessage = asynchandler(async (req, res) => {
  try {
    const userId = req.params.userId;


    // Fetch chat rooms that include the user
    const chats = await chatroom.find({ participants: userId }).lean();

    // Get the last message for each chat room
    for (let chatRoom of chats) {
      const lastMessage = await messages.findOne({ chatRoom: chatRoom._id })
        .sort({ createdAt: -1 })
        .lean();

      if (lastMessage) {
        chatRoom.lastMessage = lastMessage;
      }

      // Optionally, add details about the other user in the chat
      const otherUserId = chatRoom.participants.find((id) => id.toString() !== userId);
      if (otherUserId) {
        const otherUser = await users.findById(otherUserId).lean();
        chatRoom.user = otherUser; // Append other user details
      }
    }

    res.json(chats);
    console.log("Chats", chats)
  } catch (error) {
    console.error("Failed to fetch chat details", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = { createchatroom, getchats, deleteChats, getlastmessage };
