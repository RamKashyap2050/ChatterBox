import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import axios from "axios";
import io from "socket.io-client";
const socket = io("http://localhost:4004");

function Dashboard() {
  const [userChats, setUserChats] = useState([]);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    async function fetchChatDetails() {
      if (!user) {
        console.error("User not logged in");
        return;
      }
      try {
        // Assume the endpoint returns both users and the last message of their chat
        const response = await axios.get(`/Chats/withLastMessage/${user.id}`);
        setUserChats(response.data);
      } catch (error) {
        console.error("Failed to fetch chat details", error);
      }
    }
    fetchChatDetails();
  }, [user]);

  const handleUserSelect = async (selectedUser) => {
    if (!selectedUser || !selectedUser._id) {
      console.error("Selected user data is incomplete:", selectedUser);
      return;
    }

    const existingChat = userChats.find(
      (chat) =>
        chat.users &&
        Array.isArray(chat.users) &&
        chat.users.some((u) => u._id === selectedUser._id)
    );

    if (existingChat && existingChat.chatRoomId) {
      navigate(`/dashboard/${existingChat.chatRoomId}`, {
        state: { selectedUser, chatRoomId: existingChat.chatRoomId },
      });
    } else {
      try {
        const response = await axios.post("/Chats/create", {
          userIds: [user.id, selectedUser._id],
        });
        navigate(`/dashboard/${response.data._id}`, {
          state: { selectedUser },
        });
      } catch (error) {
        console.error("Failed to create chat room", error);
      }
    }
  };

  return (
    <div className="dashboard">
      <div
        className="user-list"
        style={{
          overflowY: "auto",
          height: "100vh",
          borderRight: "1px solid #ccc",
        }}
      >
        {userChats.map((chat) => (
          <div
            key={chat.user._id}
            onClick={() => handleUserSelect(chat.user)}
            style={{
              padding: "10px",
              borderBottom: "1px solid #ccc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={chat.user.image}
              alt="avatar"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                marginRight: "10px",
              }}
            />
            <div style={{ width: "100%" }}>
              <span>{chat.user.email}</span>

              {chat.lastMessage && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <p style={{ fontWeight: "bold", margin: 0 }}>
                    {chat.lastMessage.content}
                  </p>
                  <p style={{ fontWeight: "bold", margin: 0 }}>
                    {new Date(
                      chat.lastMessage.createdAt
                    ).toLocaleDateString() === new Date().toLocaleDateString()
                      ? new Date(
                          chat.lastMessage.createdAt
                        ).toLocaleTimeString()
                      : new Date(
                          chat.lastMessage.createdAt
                        ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
