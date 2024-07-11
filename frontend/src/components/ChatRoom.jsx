import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { useUser } from "../UserContext";
import io from "socket.io-client";
import axios from "axios";
import moment from "moment"; // Import moment
import { v4 as uuidv4 } from "uuid"; // Ensure you have uuid installed
// const socket = io("http://localhost:4004");
const socket = io();

function ChatRoom() {
  const navigate = useNavigate();
  const { chatRoomId } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { user } = useUser();
  const selectedUser = location.state?.selectedUser;

  const userId = user ? user.id : null;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/Chats/${chatRoomId}/messages`);
        setMessages(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    socket.emit("joinRoom", { chatRoomId });
    socket.on("newMessage", (receivedMessage) => {
      setMessages(prevMessages => [...prevMessages, receivedMessage]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [chatRoomId, userId]);

  if (!user) {
    console.error("User not logged in");
    return; // stop further execution
  }

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/Chats/delete/${chatRoomId}`);
      navigate("/dashboard"); // Redirect to dashboard after deletion
    } catch (error) {
      console.error("Failed to delete chat room:", error);
    }
  };

  const sendMessage = () => {
    if (input.trim() && chatRoomId && user.id) {
      const tempId = uuidv4(); // Unique ID for optimistic UI update
      const messageToSend = {
        content: input,
        chatRoomId,
        senderId: user.id,
        localId: tempId, // Attach this temporary ID
      };

   
      socket.emit("sendMessage", messageToSend);
      setInput("");
    } else {
      console.log("Required information missing to send a message");
    }
  };

  return (
    <div className="chat-room">
      <div
        className="chat-header"
        style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
      >
        {selectedUser && (
          <div style={{ justifyContent: "space-between", display: "flex" }}>
            <div style={{ justifyContent: "space-between", display: "flex" }}>
              <div>
                <img
                  src={selectedUser.image}
                  alt={selectedUser.email}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    marginRight: "10px",
                  }}
                />
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>
                  {selectedUser.user_name}
                </span>
                <br />
                <span>{selectedUser.email}</span>
              </div>
            </div>

            <div>
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: "#ff4d4f", // Red color for danger
                  color: "white", // White text color
                  padding: "10px 20px", // Padding around the text
                  border: "none", // No border
                  borderRadius: "5px", // Rounded corners
                  cursor: "pointer", // Cursor pointer on hover
                  boxShadow: "0 2px 5px rgba(255, 77, 79, 0.5)", // Shadow for depth, lightly tinted red
                }}
              >
                Delete chat
              </button>
            </div>
          </div>
        )}
      </div>
      <ul
        className="message-list"
        style={{
          listStyle: "none",
          padding: "10px",
          height: "calc(100vh - 120px)",
          overflowY: "auto",
          scrollbarWidth: "none", // For Firefox
          msOverflowStyle: "none", // For Internet Explorer 10+
          // For Webkit browsers like Safari and Chrome:
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {messages.map((msg, index) => (
          <li
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems:
                msg.sender._id === user?.id ? "flex-end" : "flex-start",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                backgroundColor:
                  msg.sender._id === user?.id ? "blue" : "#f0f0f0",
                padding: "10px",
                borderRadius: "10px",
                maxWidth: "60%",
                color: msg.sender._id === user?.id ? "white" : "black",
                textAlign: msg.sender._id === user?.id ? "right" : "left",
              }}
            >
              {msg.content}{" "}
              <span style={{ fontSize: "0.5em", marginTop: "5px" }}>
                {moment(msg.createdAt).format("LT")}{" "}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div
        style={{
          padding: "10px",
          borderTop: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: "1 0 85%", // Occupies 85% of the available width
            padding: "10px",
            marginRight: "10px", // Adds some space between the input and the button
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            width: "15%", // Occupies the remaining 15%
            padding: "10px 20px",
            background: "blue",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
