const SubAdmin = require("../models/SubAdmin");

exports.createSubAdmin = async (req, res) => {
  try {
    const { name, email, role, password, adminId } = req.body;

    if (!name || !email || !role || !password || !adminId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await SubAdmin.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sessionId = crypto.randomBytes(12).toString("hex");
    const subAdmin = new SubAdmin({
      name,
      email,
      role,
      adminId,
      password: hashedPassword,
      sessionId,
    });

    await subAdmin.save();
    res.status(201).json({ message: "subAdmin created", subAdmin });
  } catch (err) {

    res.status(500).json({ error: err?.message });
  }
};
// login
// user login
exports.subAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const subAdmin = await SubAdmin.findOne({ email });
    if (!subAdmin) {
      return res.status(404).json({ error: "sub-admin or agent not found" });
    }

    if (subAdmin.role !== "agent" || subAdmin.role !== "sub-admin") {
      return res.status(403).json({ error: "Access denied. users only." });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        name: subAdmin.name,
        id: subAdmin._id,
        email: subAdmin.email,
        adminId: subAdmin.adminId,
        role: subAdmin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "SubAdmin or Agent login successful",
      token,
      user,
    });
  } catch (err) {

    res.status(500).json({ error: err?.message });
  }
};
// get all users
exports.getAllSubAdmins = async (req, res) => {
  try {
    const subAdmins = await SubAdmin.find();

    if (!subAdmins) {
      return res.status(404).json({ error: "subAdmins not exist" });
    }

    res.status(200).json({ subAdmins });
  } catch (err) {

    res.status(500).json({ error: err?.message });
  }
};
