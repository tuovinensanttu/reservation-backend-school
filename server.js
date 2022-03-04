require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Path imports
const service = require("./routes/api/service");
const users = require("./routes/api/users");
const authentication = require("./routes/api/authentication");
const reservation = require("./routes/api/reservations");

const app = express();

app.use(bodyParser.json());

app.use("/v1/users", users);
app.use("/v1/auth", authentication);
app.use("/v1/services", service);
app.use("/v1/reservationssa", reservation);

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error ", err));

const PORT = 5000;

app.listen(PORT, () => console.log(`Application running on port ${PORT}`));
