import React, { useState } from "react";
import { TextField, Button, Typography, Paper } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext"; 

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useUser(); 

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(`/Users/register`, {
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      setUser({
        email: response.data.email,
        ...response.data,
      });

      console.log("User from Register",response.data);
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response ? error.response.data : "Server error"
      );
      alert("Registration failed!");
    }
  };

  return (
    <Paper style={{ padding: 20 }}>
      <Typography variant="h5" style={{ marginBottom: 20 }}>
        Sign Up
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="email"
          label="Email"
          type="email"
          fullWidth
          required
          value={formData.email}
          onChange={handleChange}
          style={{ marginBottom: 20 }}
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          fullWidth
          required
          value={formData.password}
          onChange={handleChange}
          style={{ marginBottom: 20 }}
        />
        <TextField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          fullWidth
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          style={{ marginBottom: 20 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Sign Up
        </Button>
      </form>
    </Paper>
  );
};

export default Register;
