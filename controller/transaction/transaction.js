import express from "express";
import moment from "moment";
import supabase from "./../../config/supabase.js";
import configureMiddleware from "./../../config/middleware.js";
import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/transactions/create", authenticateToken, async (req, res) => {
  try {
    const { pet_id, price, status } = req.body;
    const transaction_date = moment().format("YYYY-MM-DD HH:mm:ss");
    const user_id = req.user.user_id;

    if (!pet_id || !price || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields (pet_id, price, status) are required.",
      });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number.",
      });
    }

    if (!["pending", "done", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of the following: 'pending', 'done', 'cancelled'.",
      });
    }

    const { data: petData, error: petError } = await supabase
      .from("pets")
      .select("*")
      .eq("pets_id", pet_id)
      .single();

    if (petError || !petData) {
      return res.status(404).json({
        success: false,
        message: "Pet not found or unavailable.",
      });
    }

    const { data, error } = await supabase.from("transactions").insert([
      {
        user_id,
        pet_id,
        price,
        transaction_date,
        status,
        created_at: transaction_date,
        updated_at: transaction_date,
      },
    ]);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to create transaction.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction created successfully!",
      data: data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the transaction.",
      error: error.message,
    });
  }
});

// Get All Transactions
router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("transactions").select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch transactions.",
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
      message: "An error occurred while fetching transactions.",
      error: error.message,
    });
  }
});

// Get Transaction By ID
router.get("/transactions/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("transaction_id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
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
      message: "An error occurred while fetching the transaction.",
      error: error.message,
    });
  }
});

// Update Transaction
router.put("/transactions/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { price, status } = req.body;
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number.",
      });
    }

    if (status && !["pending", "done", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of the following: 'pending', 'done', 'cancelled'.",
      });
    }

    const updates = {
      ...(price && { price }),
      ...(status && { status }),
      updated_at,
    };

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("transaction_id", id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to update transaction.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the transaction.",
      error: error.message,
    });
  }
});

// Delete Transaction
router.delete("/transactions/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("transactions")
      .delete()
      .eq("transaction_id", id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete transaction.",
        error: error.message,
      });
    }

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully!",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the transaction.",
      error: error.message,
    });
  }
});

export default router;
