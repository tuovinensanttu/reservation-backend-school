const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const router = express.Router();

const auth = require("../../middleware/auth");
const User = require("../../models/User");

// @route   POST v1/users
// @desc    Create new user
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        email,
        phone,
        password: encryptedPassword,
      });

      await newUser.save();

      // Create jwt token and return it in response
      const jwtPayload = {
        user: {
          id: newUser.id,
        },
      };

      jwt.sign(
        jwtPayload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (e) {
      res.status(500).send("Server error");
    }
  }
);

// @route   PUT v1/users
// @desc    Update current user
// @access  Protected
router.put("/", auth, async (req, res) => {
  try {
    const { email, ...rest } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: rest },
      { new: true }
    ).select("-password");
    res.status(200).json(updatedUser);
  } catch (e) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
