import express from "express";
import bcrypt from "bcryptjs";
import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";
import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

// Create a new user
router.post("/users", async (req, res) => {
  try {
    const { username, email, password, role_id } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        username,
        email,
        password: hashedPassword,
        role_id,
        is_verified: true,
      })
      .select("*");

    if (insertError) {
      return res.status(500).json({ success: false, message: insertError.message });
    }

    res.status(200).json({
      success: true,
      message: "User added successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Retrieve all users
router.get("/users", async (req, res) => {
  try {
    const { data: users, error } = await supabase.from("users").select("*").order("created_at", { ascending: true });
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Retrieve user by ID
router.get("/user-id", async (req, res) => {
  try {
    const { id } = req.query;
    const { data: user, error } = await supabase.from("users").select("*").eq("users_id", id).single();
    if (error || !user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update user by ID
router.put("/users", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;
    const { username, email, password, role_id } = req.body;
    let updatedData = { username, email, role_id };

    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    const { data: updatedUser, error: updateError } = await supabase.from("users").update(updatedData).eq("users_id", id).select("*");

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete user by ID
router.delete("/users", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;
    const { data: deletedUser, error: deleteError } = await supabase.from("users").delete().eq("users_id", id).select("*");
    if (deleteError) return res.status(500).json({ success: false, message: deleteError.message });

    res.status(200).json({ success: true, message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
