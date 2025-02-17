import express from "express";
import supabase from "./../../config/supabase.js";
import configureMiddleware from "./../../config/middleware.js";
import authenticateToken from "../../helper/token.js";
import moment from "moment";

const app = express();
configureMiddleware(app);
const router = express.Router();

// Create Transaction
router.post("/transactions/create", authenticateToken, async (req, res) => {
  try {
    const { status, type } = req.body;
    const user_id = req.user.user_id;

    if (!status || !type) {
      return res.status(400).json({
        success: false,
        message: "All fields (status, type) are required.",
      });
    }

    if (!["pending", "done", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be one of the following: 'pending', 'done', 'cancelled'.",
      });
    }

    const created_at = moment().format("YYYY-MM-DD HH:mm:ss");
    const updated_at = created_at;

    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id,
          status,
          type,
          created_at,
          updated_at,
        },
      ])
      .select("*");

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
      data: transaction,
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
    const { data, error } = await supabase
      .from("transactions")
      .select("*, users(*)");

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
      .select("*,  users(*)")
      .eq("transactions_id", id)
      .single();

    if (error) {
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

// Get Transaction By Buyer
router.get("/transactions-buyer", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const { data, error } = await supabase
      .from("transactions")
      .select(`*`)
      .eq("user_id", user_id);

    if (error) {
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

// Get Transaction By seller
router.get("/transactions-seller", authenticateToken, async (req, res) => {
  try {
    const seller_id = req.user.user_id;

    const { data, error } = await supabase
      .from("transactions")
      .select(`*`)
      .eq("seller_id", seller_id);

    if (error) {
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
    const { status, type } = req.body;
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    if (status && !["pending", "done", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be one of the following: 'pending', 'done', 'cancelled'.",
      });
    }

    const updates = {
      ...(status && { status }),
      ...(type && { type }),
      updated_at,
    };

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("transactions_id", id)
      .select("*");

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
      .eq("transactions_id", id)
      .select("*");

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete transaction.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully!",
      data,
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
