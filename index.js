import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import configureMiddleware from "./config/middleware.js";
import regitration from "./controller/auth/registration.js";
import verify from "./controller/auth/verifyEmail.js";
import login from "./controller/auth/login.js";
import business from "./controller/business/business.js";
import pets from "./controller/pets/createPets.js";
import businessCategories from "./controller/businessCategory/businessCategories.js";
import trasaction from "./controller/transaction/transaction.js";
import product from "./controller/products/products.js";
import user from "./controller/users/users.js";
import petCategory from "./controller/petCategory/petCategory.js";
import petSales from "./controller/petSales/petSales.js";
import groomingReservations from "./controller/groomingReservations/groomingReservations.js";
import prodctSales from "./controller/productSales/productSales.js";
import eventParticipant from "./controller/eventParticipant/eventParticipant.js";
import photograpy from "./controller/photograpy/photograpy.js";
import groomingServices from "./controller/groomingservice/groomingservices.js";
import photocraphyService from "./controller/photography_services/photography_services.js";

import roles from "./controller/roles/roles.js";

dotenv.config();

const port = 3000;
const app = express();
configureMiddleware(app);
app.use(cookieParser());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/auth", regitration);
app.use("/auth", login);
app.use("/api", roles);
app.use(verify);
app.use("/api", business);
app.use("/api", pets);
app.use("/api", businessCategories);
app.use("/api", trasaction);
app.use("/api", product);
app.use("/api", user);
app.use("/api", petCategory);
app.use("/api", petSales);
app.use("/api", groomingReservations);
app.use("/api", prodctSales);
app.use("/api", eventParticipant);
app.use("/api", photograpy);
app.use("/api", groomingServices);
app.use("/api", photocraphyService);

app.listen(port, () => {
  console.log(`running server on port ${port}`);
});
