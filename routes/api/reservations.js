const express = require("express");
const router = express.Router();

const isAuthorized = require("../../util/isAuthorized");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Reservation = require("../../models/Reservation");

// @route   GET v1/reservations/
// @desc    Get all reservations
// @access  Public
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find({})
      .select("-user")
      .populate("service", ["name", "email", "phone", "serviceType"]);
    res.status(200).json(reservations);
  } catch (e) {
    res.status(500).send("Server error");
  }
});

// @route   GET v1/reservations/:id
// @desc    Get reservation by id
// @access  Protected
router.get("/:id", auth, async (req, res) => {
  try {
    // Populate user and service data
    const reservation = await Reservation.findOne({ _id: req.params.id })
      .populate("user", ["name", "email", "phone"])
      .populate("service", ["name", "email", "phone", "serviceType"]);

    if (!reservation) {
      res
        .status(404)
        .json({ errors: [{ msg: "No reservation with that id" }] });
    }

    // Get user object for service id
    const user = await User.findOne({ _id: req.user.id });

    // If reservation doesn't belong to authenticated user OR
    // to service they are maintaining, return error
    if (!isAuthorized(reservation, user)) {
      res.status(403).json({
        errors: [{ msg: "You are not authorized to read this data" }],
      });
    }
    // Otherwise return reservation
    res.status(200).json(reservation);
  } catch (e) {
    res.status(500).send("Server error");
  }
});


module.exports = router;
