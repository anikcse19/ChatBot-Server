const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  try {
    const { name, email, role, password, adminId } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sessionId = crypto.randomBytes(12).toString("hex");
    const user = new User({
      name,
      email,
      role,
      adminId,
      password: hashedPassword,
      sessionId,
    });

    await user.save();
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: err?.message });
  }
};
// user login
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "user") {
      return res.status(403).json({ error: "Access denied. users only." });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "user login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("user login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
// get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users) {
      return res.status(404).json({ error: "users not exist" });
    }

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.getUserByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    if (!userId) {
      return res.status(400).json({ error: "user ID is required" });
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
};
