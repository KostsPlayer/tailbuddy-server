import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";

import supabase from "./../../config/supabase.js";
import { sendVerificationEmail } from "./../../helper/sendVerificationEmail.js";
import configureMiddleware from "./../../config/middleware.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/auth/registration", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const created_at = moment().format("YYYY-MM-DD HH:mm:ss");

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    // Query untuk memeriksa apakah email sudah ada
    const { data: emailExists, error: emailError } = await supabase
      .from("users")
      .select("email") // Pilih kolom spesifik untuk efisiensi
      .eq("email", email)
      .single();

    if (emailExists) {
      // Jika email sudah ada
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Query untuk memeriksa apakah username sudah ada
    const { data: usernameExists, error: usernameError } = await supabase
      .from("users")
      .select("username") // Pilih kolom spesifik untuk efisiensi
      .eq("username", username)
      .single();

    if (usernameExists) {
      // Jika username sudah ada
      return res.status(400).json({
        success: false,
        message: "Username already exists.",
      });
    }

    // Jika email dan username belum ada, lanjutkan proses pendaftaran

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from("users").insert([
      {
        username: username,
        email: email,
        password: hashedPassword,
        role: "customer",
        created_at: created_at,
        updated_at: created_at,
        is_verified: false,
      },
    ]);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Buat token verifikasi
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Kirim email verifikasi
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "An error occurred during registration", error });
  }
});

router.post("/auth/choose-role", async (req, res) => {
  try {
    const { userID } = req.query;

    if (!userID) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const { data: userData, error: getError } = await supabase.from("users").select("user_id").eq("user_id", id);

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    if (userData.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User with id = ${userID} not found`,
      });
    }

    const { role } = req.body;

    const { data: updatedData, error: updateError } = await supabase
      .from("users")
      .update({
        role: role,
      })
      .eq("user_id", userID);

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({
        success: false,
        message: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updatedData,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: updateError.message,
    });
  }
});

export default router;
