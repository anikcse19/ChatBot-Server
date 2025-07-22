const User = require("../models/User");
const crypto = require("crypto");
exports.createUser = async (req, res) => {
  try {
    const { name, email, role, isOnline } = req.body;

    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, and role are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }
    const sessionId = crypto.randomBytes(12).toString("hex");
    const user = new User({
      name,
      email,
      role,
      sessionId,
      // isOnline: role === "admin" ? !!isOnline : undefined,
    });

    // const user = new User({
    //   name,
    //   email,
    //   role,
    //   isOnline: role === "admin" ? !!isOnline : undefined,
    // });

    await user.save();
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.error("Create user error:", err);
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
    console.log( userId);

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