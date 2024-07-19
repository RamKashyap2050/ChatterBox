import React from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import { UserProvider } from "./UserContext";
import axios from "axios";

import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from "@mui/material";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import ChatRoom from "./components/ChatRoom";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import CreateNewChat from "./components/CreateNewChat";

function App() {
  return (
    <UserProvider>
      <Router>
        {/* <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Cookie Auth
            </Typography>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/signup">
              Sign Up
            </Button>
          </Toolbar>
        </AppBar> */}
        <Navbar />
        <Container style={{ marginTop: 20 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard/:chatRoomId" element={<ChatRoom />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/createnewchat" element={<CreateNewChat />} />
          </Routes>
        </Container>
      </Router>
    </UserProvider>
  );
}

axios.defaults.withCredentials = true;

export default App;
