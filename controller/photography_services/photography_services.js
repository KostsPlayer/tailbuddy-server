import express from "express";
import supabase from "../../config/supabase.js";
import authenticateToken from "../../helper/token.js";
import moment from "moment";

const router = express.Router();

// Create Photography Service
router.post(
  "/photography-service/create",
  authenticateToken,
  async (req, res) => {
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, price) are required.",
      });
    }

    const { data, error } = await supabase
      .from("photography_services")
      .insert([{ name, price }])
      .select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to create photography service.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Photography service created successfully!",
      data,
    });
  }
);

// Get All Photography Services
router.get("/photography-service", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("photography_services")
      .select("*");

    if (error) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Failed to fetch photography services.",
          error: error.message,
        });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while fetching photography services.",
        error: error.message,
      });
  }
});

// Get Photography Service by ID
router.get("/photography-service/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("photography_services")
      .select("*")
      .eq("photography_services_id", id)
      .single();

    if (error || !data) {
      return res
        .status(404)
        .json({ success: false, message: "Photography service not found." });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while fetching photography service.",
        error: error.message,
      });
  }
});

// Update Photography Service
router.put(
  "/photography-service/update/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price } = req.body;

      if (!name || !price) {
        return res
          .status(400)
          .json({
            success: false,
            message: "All fields (name, price) are required.",
          });
      }

      const { data, error } = await supabase
        .from("photography_services")
        .update({ name, price })
        .eq("photography_services_id", id)
        .select("*");

      if (error || !data.length) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Failed to update photography service.",
          });
      }

      res
        .status(200)
        .json({
          success: true,
          message: "Photography service updated successfully!",
          data,
        });
    } catch (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while updating photography service.",
          error: error.message,
        });
    }
  }
);

// Delete Photography Service
router.delete(
  "/photography-service/delete/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("photography_services")
        .delete()
        .eq("photography_services_id", id);

      if (error) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Failed to delete photography service.",
          });
      }

      res
        .status(200)
        .json({
          success: true,
          message: "Photography service deleted successfully!",
        });
    } catch (error) {
      console.error("Error:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while deleting photography service.",
          error: error.message,
        });
    }
  }
);

export default router;
