import express from "express";
import supabase from "../../config/supabase.js";
import authenticateToken from "../../helper/token.js";
import moment from "moment";

const router = express.Router();

// Create photograpy
router.post("/photograpy/create", authenticateToken, async (req, res) => {
  try {
    const { transaction_id, price, schedule, service, status } = req.body;

    if (!transaction_id || !price || !schedule || !service || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields (transaction_id, price, schedule, service, status) are required.",
      });
    }

    const created_at = moment().format("YYYY-MM-DD HH:mm:ss");

    const { data, error } = await supabase
      .from("photograpies")
      .insert([
        {
          transaction_id,
          price,
          schedule,
          service,
          status,
          created_at,
          updated_at: created_at,
        },
      ])
      .select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to create photograpy.",
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "photograpy created successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating photograpy.",
      error: error.message,
    });
  }
});

// Get All photograpys
router.get("/photograpy", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("photograpies").select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch photograpys.",
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
      message: "An error occurred while fetching photograpys.",
      error: error.message,
    });
  }
});

// Get photograpy By ID
router.get("/photograpy/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("photograpies").select("*").eq("grooming_reservations_id", id).single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "photograpy not found.",
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
      message: "An error occurred while fetching the photograpy.",
      error: error.message,
    });
  }
});

// Update photograpy
router.put("/photograpy/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id, price, schedule, service, status } = req.body;
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    const updates = {
      ...(transaction_id && { transaction_id }),
      ...(price && { price }),
      ...(schedule && { schedule }),
      ...(service && { service }),
      ...(status && { status }),
      updated_at,
    };

    const { data, error } = await supabase.from("photograpies").update(updates).eq("grooming_reservations_id", id).select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to update photograpy.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "photograpy updated successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the photograpy.",
      error: error.message,
    });
  }
});

// Delete photograpy
router.delete("/photograpy/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("photograpies").delete().eq("grooming_reservations_id", id).select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete photograpy.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "photograpy deleted successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the photograpy.",
      error: error.message,
    });
  }
});

export default router;
