import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import configureMiddleware from "./config/middleware.js";
import regitration from "./controller/auth/registration.js";
import verify from "./controller/auth/verifyEmail.js";
import login from "./controller/auth/login.js";

dotenv.config();

const port = 3000;
const app = express();
configureMiddleware(app);
app.use(cookieParser());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(regitration);
app.use(verify);
app.use(login);

app.listen(port, () => {
  console.log(`running server on port ${port}`);
});
