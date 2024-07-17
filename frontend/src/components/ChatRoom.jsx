import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { useUser } from "../UserContext";
import io from "socket.io-client";
import axios from "axios";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:4004";

const socket = io(BASE_URL, { path: "/socket.io/" });

function ChatRoom() {
  const navigate = useNavigate();
  const { chatRoomId } = useParams();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { user } = useUser();
  const selectedUser = location.state?.selectedUser;

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.get(
        `${BASE_URL}/Chats/${chatRoomId}/messages`
      );
      setMessages(response.data);
    };

    fetchMessages();

    socket.emit("joinRoom", { chatRoomId });
    socket.on("newMessage", (receivedMessage) => {
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    });

    return () => socket.off("newMessage");
  }, [chatRoomId]);

  if (!user) {
    console.error("User not logged in");
    return null; // Stop further execution and render nothing
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/Chats/delete/${chatRoomId}`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to delete chat room:", error);
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      const tempId = uuidv4();
      const messageToSend = {
        content: input,
        chatRoomId,
        senderId: user.id,
        localId: tempId,
      };

      socket.emit("sendMessage", messageToSend);
      setInput("");
    }
  };

  const renderMessages = () => {
    let lastDate = null;
    const messageElements = [];

    messages.forEach((msg, index) => {
      const messageDate = moment(msg.createdAt).format("YYYY-MM-DD");
      if (messageDate !== lastDate) {
        messageElements.push(
          <div
            key={messageDate}
            style={{
              textAlign: "center",
              margin: "20px auto",
              backgroundColor: "#F5F5DC",
              borderRadius: "6px",
              maxWidth: "25%",
              alignContent: "center",
              fontWeight: "lighter",
              fontSize: "0.8rem",
            }}
          >
            {moment(msg.createdAt).format("MMMM DD, YYYY")}
          </div>
        );
        lastDate = messageDate;
      }
      messageElements.push(
        <li
          key={index}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: msg.sender._id === user?.id ? "flex-end" : "flex-start",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              backgroundColor: msg.sender._id === user?.id ? "blue" : "#f0f0f0",
              padding: "10px",
              borderRadius: "10px",
              maxWidth: "60%",
              color: msg.sender._id === user?.id ? "white" : "black",
              textAlign: msg.sender._id === user?.id ? "right" : "left",
            }}
          >
            {msg.content}{" "}
            <span style={{ fontSize: "0.5em", marginTop: "5px" }}>
              {moment(msg.createdAt).format("LT")}
            </span>
          </div>
        </li>
      );
    });

    return messageElements;
  };

  return (
    <div className="chat-room">
      <div
        className="chat-header"
        style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
      >
        {selectedUser && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
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
              <div>
                <span style={{ fontWeight: "bold" }}>
                  {selectedUser.user_name}
                </span>
                <br />
                <span>{selectedUser.email}</span>
              </div>
            </div>
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: "#ff4d4f",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(255, 77, 79, 0.5)",
              }}
            >
              Delete chat
            </button>
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
          msOverflowStyle: "none", // For Internet Explorer and Edge
          // For Webkit browsers like Safari and Chrome:
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {renderMessages()}
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
            flex: "1 0 auto",
            padding: "10px",
            marginRight: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
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
