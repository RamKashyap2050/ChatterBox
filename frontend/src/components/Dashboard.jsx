import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import axios from "axios";
import io from "socket.io-client";
const socket = io("http://localhost:4004");

function Dashboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await axios.get("/Users/getusers");
        const filteredUsers = response.data.filter(u => u._id !== user.id);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    }
    fetchUsers();
  }, [user]);
  if (!user) {
    console.error("User not logged in");
    // navigate('/login'); // redirect to login page or a suitable page
    return; // stop further execution
  }

  const handleUserSelect = async (selectedUser) => {
    if (user.id === selectedUser._id) return; // Prevent creating a chat with oneself
    try {
      const response = await axios.post("/Chats/create", {
        userIds: [user.id, selectedUser._id],
      });
      navigate(`/dashboard/${response.data._id}`, { state: { selectedUser } });
    } catch (error) {
      console.error("Failed to create chat room", error);
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
        {users.map((userItem) => (
          <div
            key={userItem._id}
            onClick={() => handleUserSelect(userItem)}
            style={{
              padding: "10px",
              borderBottom: "1px solid #ccc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={userItem.image}
              alt="avatar"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                marginRight: "10px",
              }}
            />
            <span>{userItem.email}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
