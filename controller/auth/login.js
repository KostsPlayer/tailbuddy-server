import express from "express";
import dotenv from "dotenv";
import { google } from "googleapis";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import moment from "moment";

import supabase from "./../../config/supabase.js";
import { oauth2Client, authorizationUrl } from "./../../helper/googleApis.js";
import configureMiddleware from "./../../config/middleware.js";

dotenv.config();

const app = express();
configureMiddleware(app);
const router = express.Router();

// Endpoint untuk redirect ke Google Login
router.get("/auth/google", async (req, res) => {
  res.redirect(authorizationUrl);
});

// Callback Google setelah login berhasil
router.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  const created_at = moment().format("YYYY-MM-DD HH:mm:ss");

  try {
    // Mendapatkan token dari Google
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    // Mendapatkan data user dari Google
    const { data } = await oauth2.userinfo.get();

    if (!data) {
      return res.status(400).json({
        message: "Unable to fetch user info from Google.",
      });
    }

    // Menentukan username, menggunakan name jika username tidak ada
    const username = data.name || data.email;

    // Cek apakah user sudah ada di Supabase
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", data.email)
      .single(); // Mengambil satu data jika ada

    if (error && error.code !== "PGRST116") {
      // Jika error bukan karena data tidak ditemukan
      console.error("Error checking user existence:", error.message);
      return res.status(500).json({
        message: "An error occurred while checking the user.",
        error: error.message,
      });
    }

    let user;

    if (!existingUser) {
      // Jika user belum ada, buat user baru
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            email: data.email,
            username: username,
            password: null,
            created_at: created_at,
            updated_at: created_at,
            is_verified: true,
            role: "customer",
          },
        ])
        .select("*")
        .single();

      if (insertError) {
        return res.status(500).json({
          message: "An error occurred while creating the user.",
          error: insertError.message,
        });
      }

      user = newUser;
    } else {
      // Jika user sudah ada, gunakan data user yang ada
      user = existingUser;
    }

    // Membuat token JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    if (user.role === "admin") {
      return res.redirect(
        `https://shopify-bliss.vercel.app/dashboard?shopify-bliss=${token}`
      );
    } else if (user.role === "customer") {
      return res.redirect(
        `https://shopify-bliss.vercel.app/profile?shopify-bliss=${token}`
      );
    }
  } catch (error) {
    console.error(
      "Error during Google OAuth:",
      error?.response?.data || error.message
    );
    return res.status(500).json({
      message: "An error occurred during Google OAuth.",
      error: error?.response?.data || error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validasi input
    if (!password || (!email && !username)) {
      return res.status(400).json({
        message: "Password and either email or username are required.",
      });
    }

    // Ambil data user beserta role dari tabel roles
    const { data: users, error } = await supabase
      .from("users")
      .select(`
        *,
        roles:role_id (role, roles_id)
      `)
      .or(`email.eq.${email},username.eq.${username}`)
      .limit(1);

    if (error) {
      throw new Error("Failed to fetch user");
    }

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = users[0];

    // Cek apakah akun sudah diverifikasi
    if (!user.is_verified) {
      return res.status(403).json({
        message: "Account not verified. Please verify your account.",
      });
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password.",
      });
    }

    // Ambil role_id dan role name
    const role_id = user.roles.roles_id;
    const role = user.roles.role;

    // Buat payload JWT
    const payload = {
      user_id: user.users_id,
      username: user.username,
      email: user.email,
      role_id,
      role,
    };

    // Debug payload
    console.log("Payload for JWT:", payload);

    // Membuat token JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Kirim token dalam response
    res.json({
      message: "Login successfully.",
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "An error occurred during login", error });
  }
});


export default router;
