import express from "express";
import supabase from "../../config/supabase.js";
import configureMiddleware from "../../config/middleware.js";
import authenticateToken from "../../helper/token.js";
import moment from "moment";

const app = express();
configureMiddleware(app);
const router = express.Router();

// Create a new pet category
router.post("/pet-categories", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const { data: newCategory, error: insertError } = await supabase
      .from("pet_categories")
      .insert({
        name,
      })
      .select("*");

    if (insertError) {
      return res.status(500).json({ success: false, message: insertError.message });
    }

    res.status(200).json({
      success: true,
      message: "Pet category added successfully",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Retrieve all pet categories
router.get("/pet-categories", async (req, res) => {
  try {
    const { data: categories, error } = await supabase.from("pet_categories").select("*");
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Retrieve pet category by ID
router.get("/pet-categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data: category, error } = await supabase.from("pet_categories").select("*").eq("pet_categories_id", id).single();
    if (error || !category) return res.status(404).json({ success: false, message: "Pet category not found" });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update pet category by ID
router.put("/pet-categories/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const { data: updatedCategory, error: updateError } = await supabase.from("pet_categories").update({ name, updated_at }).eq("pet_categories_id", id).select("*");

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.status(200).json({ success: true, message: "Pet category updated successfully", data: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete pet category by ID
router.delete("/pet-categories/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: deletedCategory, error: deleteError } = await supabase.from("pet_categories").delete().eq("pet_categories_id", id).select("*");
    if (deleteError) return res.status(500).json({ success: false, message: deleteError.message });
    res.status(200).json({ success: true, message: "Pet category deleted successfully", data: deletedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
