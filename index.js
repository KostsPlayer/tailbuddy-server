import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import regitration from "./controller/auth/registration.js";
import verify from "./controller/auth/verifyEmail.js";
import login from "./controller/auth/login.js";
import typeTemplate from "./controller/type/type_templates.js";
import font from "./controller/font/font.js";
import section from "./controller/section/section.js";
import navbarFeature from "./controller/navbar_feature/navbar_feature.js";
import navbarLayout from "./controller/navbar_layout/navbar_layout.js";

import configureMiddleware from "./config/middleware.js";

dotenv.config();

const port = 3000;
const app = express();
configureMiddleware(app);
app.use(cookieParser());

app.use(express.json());

app.use(regitration);
app.use(verify);
app.use(login);
app.use(typeTemplate);
app.use(font);
app.use(section);
app.use(navbarFeature);
app.use(navbarLayout);

app.listen(port, () => {
  console.log(`running server on port ${port}`);
});
