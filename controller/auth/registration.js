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

router.post("/registration", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const created_at = moment().format("YYYY-MM-DD HH:mm:ss");

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    // Gabungan validasi email dan username
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("email, username")
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: "Username already exists.",
        });
      }
    }

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // Handle unexpected error
      throw new Error(userCheckError.message);
    }

    // Jika email dan username belum ada, lanjutkan proses pendaftaran

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from("users").insert([
      {
        username: username,
        email: email,
        password: hashedPassword,
        role_id: "91a8a216-31ed-4945-8b82-cbc87b044739",
        created_at: created_at,
        updated_at: created_at,
        is_verified: false,
      },
    ]);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({
      message: "Registration successfully!",
    });
  } catch (error) {
    console.log("Error:", error);
    res
      .status(500)
      .json({ message: "An error occurred during registration", error });
  }
});

router.put("/choose-role", async (req, res) => {
  try {
    const { email } = req.query;
    const { role_id } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    // Buat token verifikasi
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Kirim email verifikasi
    await sendVerificationEmail(email, verificationToken);

    const { data: userData, error: getError } = await supabase
      .from("users")
      .select("email, users_id")
      .eq("email", email)
      .single();

    console.log("userData:", userData);

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        message: getError.message,
      });
    }

    if (userData.length === 0) {
      return res.status(404).json({
        message: `Email ${email} is not found`,
      });
    }

    const { data: updatedData, error: updateError } = await supabase
      .from("users")
      .update({
        role_id: role_id,
      })
      .eq("users_id", userData.users_id)
      .single();

    if (updateError) {
      return res.status(500).json({
        message: updateError.message,
      });
    }

    return res.status(200).json({
      message:
        "Role updated successfully. Please check your email to verify your account!",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
