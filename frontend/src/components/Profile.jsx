import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import { CameraAlt, Backup, Delete, Block } from "@mui/icons-material";
import { useUser } from "../UserContext";
import axios from "axios"; // Ensure you have axios installed

const Profile = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
  
      try {
        setLoading(true);
        // Sending the image to the server via axios
        const response = await axios.put(`/Users/update-profile-image/${user.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
  
        if (response.data.imageUrl) {
          setUser({ ...user, image: response.data.imageUrl });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error updating image:", error.response ? error.response.data : "Network error");
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "20px" }}>
      <Card>
        <CardContent style={{ textAlign: "center", position: "relative" }}>
          <Avatar
            alt="User profile"
            src={user?.image}
            sx={{ width: 150, height: 150, margin: "auto" }}
          />
          <IconButton
            color="primary"
            component="label"
            sx={{
              position: "relative",
              top: -150,
              left: 55,
            }} // Adjust positioning
          >
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleImageChange}
            />
            <CameraAlt />
          </IconButton>
          {loading && (
            <CircularProgress
              size={40}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                marginTop: "-20px",
                marginLeft: "-20px",
              }}
            />
          )}
          <Typography variant="h6">User Name: {user?.user_name}</Typography>
          <Typography color="textSecondary">Email: {user?.email}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="body1">Bio</Typography>
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={user?.bio}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="body1">Settings</Typography>
        </CardContent>
        <CardActions>
          <Button
            startIcon={<Backup />}
            variant="outlined"
            sx={{ borderRadius: 20 }}
          >
            Backup Data
          </Button>
          <Button
            startIcon={<Delete />}
            variant="outlined"
            sx={{ borderRadius: 20 }}
          >
            Clear All Chats
          </Button>
          <Button
            startIcon={<Block />}
            variant="outlined"
            sx={{ borderRadius: 20 }}
          >
            Block People
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};

export default Profile;
