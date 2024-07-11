import React from "react";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../UserContext"; // Make sure the path is correct

const Navbar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const handleLogout = () => {
    // Implement logout functionality
    // For example, clear the user context and perhaps clear cookies or localStorage
    setUser(null);
    // You might want to make a logout API call or redirect user
    console.log("Logged out");
    navigate("/login")
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };
  return (
    <div>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            style={{ flexGrow: 1 }}
            onClick={handleDashboard}
          >
            ChatterBox
          </Typography>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/profile">
                {user.user_name}
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/signup">
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Navbar;
