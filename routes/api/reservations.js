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

// @route   POST v1/reservations
// @desc    Create new reservation
// @access  Protected
router.post("/", auth, async (req, res) => {
  try {
    const { startTime, endTime, service } = req.body;

    const reservation = new Reservation({
      startTime,
      endTime,
      service,
      user: req.user.id,
    });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (e) {
    res.status(500).send("Server error");
  }
});

// @route   PUT v1/reservations/:id
// @desc    Update reservation by id
// @access  Protected
router.put("/:id", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const reservation = await Reservation.findOne({ _id: req.params.id });

    // Check that reservation exists
    if (!reservation) {
      res
          .status(404)
          .json({ errors: [{ msg: "No reservation with that id" }] });
    }

    // Check if user is authenticated to make changes
    if (!isAuthorized(reservation, user)) {
      res.status(403).json({
        errors: [{ msg: "You are not authorized to read this data" }],
      });
    }

    const updatedReservation = await Reservation.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        { new: true }
    );

    res.json(updatedReservation);
  } catch (e) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
