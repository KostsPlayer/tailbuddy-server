import express from "express";
import supabase from "../../config/supabase";
import authenticateToken from "../../helper/token";
import moment from "moment";

const router = express.Router();

// Create Grooming Service
router.post("/grooming-service/create", authenticateToken, async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, price) are required.",
      });
    }

    const { data, error } = await supabase
      .from("grooming_services")
      .insert([{ name, price }])
      .select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to create grooming service.",
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Grooming service created successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating grooming service.",
      error: error.message,
    });
  }
});

// Get All Grooming Services
router.get("/grooming-service", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("grooming_services").select("*");

    if (error) {
      return res.status(400).json({ success: false, message: "Failed to fetch grooming services.", error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: "An error occurred while fetching grooming services.", error: error.message });
  }
});

// Get Grooming Service by ID
router.get("/grooming-service/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("grooming_services").select("*").eq("id", id).single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Grooming service not found." });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: "An error occurred while fetching grooming service.", error: error.message });
  }
});

// Update Grooming Service
router.put("/grooming-service/update/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: "All fields (name, price) are required." });
    }

    const { data, error } = await supabase
      .from("grooming_services")
      .update({ name, price })
      .eq("id", id)
      .select("*");

    if (error || !data.length) {
      return res.status(400).json({ success: false, message: "Failed to update grooming service." });
    }

    res.status(200).json({ success: true, message: "Grooming service updated successfully!", data });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: "An error occurred while updating grooming service.", error: error.message });
  }
});

// Delete Grooming Service
router.delete("/grooming-service/delete/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("grooming_services").delete().eq("id", id);

    if (error) {
      return res.status(400).json({ success: false, message: "Failed to delete grooming service." });
    }

    res.status(200).json({ success: true, message: "Grooming service deleted successfully!" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ success: false, message: "An error occurred while deleting grooming service.", error: error.message });
  }
});

export default router;
