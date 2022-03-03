const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  serviceType: {
    type: String,
    trim: true,
  },
});

const Service = mongoose.model("service", ServiceSchema);
module.exports = Service;
