import express from "express";
import supabase from "../../config/supabase.js";
import authenticateToken from "../../helper/token.js";
import moment from "moment";

const router = express.Router();

// Create Pet Sale
router.post("/pet-sales/create", authenticateToken, async (req, res) => {
  try {
    const { transaction_id, pet_id } = req.body;

    if (!transaction_id || !pet_id) {
      return res.status(400).json({
        success: false,
        message: "All fields (transaction_id, pet_id) are required.",
      });
    }

    const created_at = moment().format("YYYY-MM-DD HH:mm:ss");

    const { data, error } = await supabase.from("pet_sales").insert([
      {
        transaction_id,
        pet_id,
        created_at,
        updated_at: created_at,
      },
    ]).select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to create pet sale.",
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Pet sale created successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating pet sale.",
      error: error.message,
    });
  }
});

// Get All Pet Sales
router.get("/pet-sales", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pet_sales")
      .select(`*, transactions(*), pets(*)`);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch pet sales.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching pet sales.",
      error: error.message,
    });
  }
});

// Get Pet Sale By ID
router.get("/pet-sales/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("pet_sales")
      .select(`*, transactions(*), pets(*)`)
      .eq("pet_sales_id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Pet sale not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the pet sale.",
      error: error.message,
    });
  }
});

// Update Pet Sale
router.put("/pet-sales/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id, pet_id } = req.body;
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    const updates = {
      ...(transaction_id && { transaction_id }),
      ...(pet_id && { pet_id }),
      updated_at,
    };

    const { data, error } = await supabase
      .from("pet_sales")
      .update(updates)
      .eq("pet_sales_id", id)
      .select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to update pet sale.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pet sale updated successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the pet sale.",
      error: error.message,
    });
  }
});

// Delete Pet Sale
router.delete("/pet-sales/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("pet_sales")
      .delete()
      .eq("pet_sales_id", id)
      .select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete pet sale.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pet sale deleted successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the pet sale.",
      error: error.message,
    });
  }
});

export default router;
