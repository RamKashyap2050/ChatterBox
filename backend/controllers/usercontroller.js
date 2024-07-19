const asynchandler = require("express-async-handler");
const users = require("../models/usermodel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { uploadImageToS3 } = require("../S3/s3");
const chatRoom = require("../models/chatRoom")
const googlelogin = asynchandler(async (req, res) => {
  console.log("I am Google Login");
});

const login = asynchandler(async (req, res) => {
  console.log("I am Login");
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    res.status(400);
    throw new Error("Please Enter all the fields");
  }

  const userExists = await users.findOne({ email });

  if (userExists) {
    // Use bcrypt.compare to check the provided password against the stored hash
    const isPasswordMatch = await bcrypt.compare(password, userExists.password); // Assuming userExists.password is the hashed password stored in DB

    if (isPasswordMatch) {
      console.log("Password Matched");
      const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Send a cookie with the token
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 3600000), // 1 hour
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        sameSite: "strict", // Restrict the cookie to the same site
      });

      // Include user details in the response
      res.status(200).json({
        message: "Login successful",
        user: {
          id: userExists._id,
          email: userExists.email,
          bio: userExists.bio,
          image: userExists.image,
          user_name: userExists.user_name,
        },
      });
    } else {
      console.log("Password Not matched");
      res.status(401).json({ message: "Invalid password" });
    }
  } else {
    console.log("User Doesn't exist");
    res.status(404).json({ message: "User does not exist" });
  }
});

const register = asynchandler(async (req, res) => {
  const { email, password, password_confirmation } = req.body;
  console.log(email, password, password_confirmation);

  // Ensure all fields are provided
  if (!email || !password || !password_confirmation) {
    res.status(400);
    throw new Error("Please enter all required fields!");
  }

  // Check if passwords match
  if (password !== password_confirmation) {
    res.status(400);
    throw new Error("Passwords do not match!");
  }

  const userExists = await users.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists!");
  }

  const userName = email.split("@")[0]; // Extracting user_name from email

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Creating the user with the additional user_name field
  const user = await users.create({
    email,
    password: hashedPassword,
    user_name: userName, // Storing the user_name derived from the email
  });

  if (!user) {
    res.status(400);
    throw new Error("Account not registered");
  } else {
    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Sets token expiration to 1 hour
    });

    // Send a cookie with the token
    res.cookie("token", token, {
      httpOnly: true, // The cookie cannot be accessed by client-side JS
      expires: new Date(Date.now() + 3600000), // 1 hour
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "strict", // Restrict the cookie to the same site
    });

    // Responding with the created user details, including user_name
    res.status(201).json({
      _id: user._id,
      email: user.email,
      user_name: userName, // Include user_name in the response
      bio: user.bio,
      message: "You are registered",
    });
  }
});

const verifyUser = asynchandler(async (req, res) => {
  console.log("Received cookies:", req.cookies); // Should show the JWT token if sent correctly.
  const token = req.cookies.token; // Access the token stored in cookies

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await users.findById(decoded.id).select("-password"); // Find user and exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Decoded user:", user);
    res.json({
      message: "User verified",
      user: {
        id: user._id,
        email: user.email,
        bio: user.bio,
        image: user.image,
        user_name: user.user_name,
      },
    });
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
});

const logout = asynchandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0), // Set to expire immediately
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getusers = asynchandler(async (req, res) => {
  const loggedInUserId = req.params.userId;
  console.log("Reached Get Users")
  try {
    const allUsers = await users.find({_id: {$ne: loggedInUserId}});

    const hasChatWithUser = {};

    for (const user of allUsers) {
      const existingChat = await chatRoom.findOne({
        participants: {$all: [loggedInUserId, user._id]}
      });
      hasChatWithUser[user._id] = !!existingChat;
    }

    const usersToShow = allUsers.filter(user => !hasChatWithUser[user._id]);
    console.log("Users to Show", usersToShow)
    res.json(usersToShow);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
});

const UpdateProfilePhoto = asynchandler(async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.files.image; // The input field should be named 'image'

  try {
    const imageUrl = await uploadImageToS3(file);
    const userId = req.params.userid; // Use userId from URL params

    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Update the user profile image URL in the database
    user.image = imageUrl;
    await user.save();

    res.json({
      message: "Image uploaded successfully",
      imageUrl: user.image,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = {
  googlelogin,
  login,
  register,
  verifyUser,
  logout,
  getusers,
  UpdateProfilePhoto,
};
