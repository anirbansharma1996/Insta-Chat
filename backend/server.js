const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./connection/db.js");
const Router = require("./routes/index.js");
const cookies = require("cookie-parser");
const {app , server} = require("./socket/index.js")

// const app = express();
app.use(cookies());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL  ?? "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api", Router);

connectDB().then(() => {
  server.listen(process.env.PORT, () => {
    console.log(`http://127.0.0.1:${process.env.PORT}`);
  });
});
