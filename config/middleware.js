import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const configureMiddleware = (app) => {
  app.use(express.json());
  app.use(
    cors({
      origin: ["http://localhost:5173", "https://shopify-bliss.github.io", "http://127.0.0.1:5500", "https://shopify-bliss.vercel.app"],
      methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
      credentials: true,
      optionsSuccessStatus: 200,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(bodyParser.urlencoded({ extended: true }));
};

export default configureMiddleware;
