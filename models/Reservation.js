const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  startTime: {
    type: String,
    trim: true,
    required: true,
  },
  endTime: {
    type: String,
    trim: true,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "service",
    required: true,
  },
});

const Reservation = mongoose.model("reservation", ReservationSchema);
module.exports = Reservation;
