import express from "express";
import supabase from "../../config/supabase.js";
import authenticateToken from "../../helper/token.js";
import moment from "moment";

const router = express.Router();

// Create Grooming Reservation
router.post(
  "/grooming-reservations/create",
  authenticateToken,
  async (req, res) => {
    try {
      const { transaction_id, price, schedule, service } = req.body;

      if (!transaction_id || !price || !schedule || !service) {
        return res.status(400).json({
          success: false,
          message:
            "All fields (transaction_id, price, schedule, service) are required.",
        });
      }

      const created_at = moment().format("YYYY-MM-DD HH:mm:ss");

      const { data, error } = await supabase
        .from("grooming_reservations")
        .insert([
          {
            transaction_id,
            price,
            schedule,
            service,
            created_at,
            updated_at: created_at,
          },
        ])
        .select("*");

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Failed to create grooming reservation.",
          error: error.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Grooming reservation created successfully!",
        data,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating grooming reservation.",
        error: error.message,
      });
    }
  }
);

// Get All Grooming Reservations
router.get("/grooming-reservations", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("grooming_reservations")
      .select("*, grooming_services(*)");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch grooming reservations.",
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
      message: "An error occurred while fetching grooming reservations.",
      error: error.message,
    });
  }
});

// Get Grooming Reservation By ID
router.get(
  "/grooming-reservations/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("grooming_reservations")
        .select("*, grooming_services(*)")
        .eq("grooming_reservations_id", id)
        .single();

      if (error) {
        return res.status(404).json({
          success: false,
          message: "Grooming reservation not found.",
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
        message: "An error occurred while fetching the grooming reservation.",
        error: error.message,
      });
    }
  }
);

// Update Grooming Reservation
router.put(
  "/grooming-reservations/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { transaction_id, price, schedule, service } = req.body;
      const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

      const updates = {
        ...(transaction_id && { transaction_id }),
        ...(price && { price }),
        ...(schedule && { schedule }),
        ...(service && { service }),
        updated_at,
      };

      const { data, error } = await supabase
        .from("grooming_reservations")
        .update(updates)
        .eq("grooming_reservations_id", id)
        .select("*");

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Failed to update grooming reservation.",
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Grooming reservation updated successfully!",
        data,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the grooming reservation.",
        error: error.message,
      });
    }
  }
);

// Delete Grooming Reservation
router.delete(
  "/grooming-reservations/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from("grooming_reservations")
        .delete()
        .eq("grooming_reservations_id", id)
        .select("*");

      if (error) {
        return res.status(400).json({
          success: false,
          message: "Failed to delete grooming reservation.",
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Grooming reservation deleted successfully!",
        data,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the grooming reservation.",
        error: error.message,
      });
    }
  }
);

export default router;
