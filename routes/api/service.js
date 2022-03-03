const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const User = require("../../models/User");
const Service = require("../../models/Service");

// @route   GET v1/services
// @desc    Get all services
// @access  Public
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    return res.json(services);
  } catch (e) {
    res.status(500).send("Server error");
  }
});

// @route   GET v1/services/:id
// @desc    Get service with id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id });
    res.json(service);
  } catch (e) {
    res.status(404).send("Service not found");
  }
});

// @route   POST v1/services/:id
// @desc    Create new service and mark user as maintainer
// @access  Protected
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });

    // Check if service exists
    const { email, name } = req.body;
    const existingService = await Service.findOne({ email, name });

    if (existingService) {
      res.status(400).json({ errors: [{ msg: "Service already exists" }] });
    }

    // Check if user is already a maintainer in other service
    if (user.service) {
      return res.status(409).json({
        errors: [{ msg: "User is already maintainer in another service" }],
      });
    }
    // Create new service

    const data = req.body;
    const service = new Service(data);
    await service.save();

    // Add the service ID to user => Save user
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { service: service.id },
      { new: true }
    );
    // Return data
    res.json(service);
  } catch (e) {
    res.status(500).send("Server error");
  }
});

// @route   PUT v1/services/:id
// @desc    Update service if user is "maintainer"
// @access  Protected
router.put("/:id", auth, async (req, res) => {
  // Check that user has the provided ID
  const serviceId = req.params.id;
  const user = await User.findOne({ _id: req.user.id });

  if (user?.service.toString() !== serviceId.toString()) {
    return res
      .status(403)
      .json({ errors: [{ msg: "User is not authorized to edit service" }] });
  }

  try {
    const service = await Service.findOneAndUpdate(
      { _id: serviceId },
      { $set: req.body },
      { new: true }
    );

    res.json(service);
  } catch (e) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
