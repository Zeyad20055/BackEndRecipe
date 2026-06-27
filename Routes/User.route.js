const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/UserSchena");

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ email, id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
     user:newUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { email, id: user._id }, // ✅ user مش newUser
        process.env.SECRET_KEY,
        { expiresIn: "7d" },
      );

      return res
        .status(200)
        .json({ message: "User signed in successfully", token, user });
    } else {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});


router.get("/:id", async (req, res) => {
try {
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({massage:"User not found"})
    }

    res.status(200).json({user})
} catch (error) {
    
}

})


module.exports = router;
