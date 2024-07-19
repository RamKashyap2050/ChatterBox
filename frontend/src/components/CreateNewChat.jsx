import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";

const CreateNewChat = () => {
  const [users, setUsers] = useState([]);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/Users/getusers/${user.id}`);
        // Filter out the current user from the list
        const filteredUsers = response.data.filter((u) => u._id !== user.id);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [user]);

  const handleUserSelect = async (selectedUser) => {
    if (!selectedUser || !selectedUser._id) {
      console.error("Selected user data is incomplete:", selectedUser);
      return;
    }

    const existingChat = users.find(
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
    <div
      style={{
        padding: "10px",
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => handleUserSelect(user)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            borderBottom: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          <img
            src={user.image || "default-avatar.png"} // Fallback to default avatar if none
            alt={user.user_name}
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              marginRight: "10px",
            }}
          />
          <div>
            <span style={{ fontWeight: "bold" }}>{user.user_name}</span>
            {/* <p>{user.email}</p> */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreateNewChat;
