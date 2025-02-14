import express from "express";
import supabase from "../../config/supabase.js";
import authenticateToken from "../../helper/token.js";
import moment from "moment";

const router = express.Router();

// Create Product Sale (Reduce Stock)
router.post("/product-sales/create", authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity, price, transaction_id } = req.body;

    if (!product_id || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: "Fields product_id, quantity, and price are required.",
      });
    }

    // Check Product Stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock")
      .eq("products_id", product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      });
    }

    // Insert Product Sale
    const created_at = moment().format("YYYY-MM-DD HH:mm:ss");
    const { data: sale, error: saleError } = await supabase
      .from("product_sales")
      .insert([
        {
          product_id,
          transaction_id,
          quantity,
          price,
          created_at,
          updated_at: created_at,
        },
      ])
      .select("*");

    if (saleError) {
      return res.status(400).json({
        success: false,
        message: "Failed to create product sale.",
        error: saleError.message,
      });
    }

    // Update Product Stock
    const newStock = product.stock - quantity;
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("products_id", product_id);

    if (updateError) {
      return res.status(400).json({
        success: false,
        message: "Failed to update product stock.",
        error: updateError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Product sale created successfully!",
      sale,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating product sale.",
      error: error.message,
    });
  }
});

// Get All Product Sales
router.get("/product-sales", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("product_sales").select(`*, product:product_id(*), transaction:transaction_id(*)`);

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch product sales.",
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
      message: "An error occurred while fetching product sales.",
      error: error.message,
    });
  }
});

// Get Product Sale By ID
router.get("/product-sales/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("product_sales")
      .select(`*, product:product_id(*), transaction:transaction_id(*)`)
      .eq("product_sales_id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Product sale not found.",
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
      message: "An error occurred while fetching product sale.",
      error: error.message,
    });
  }
});

// Update Product Sale
router.put("/product-sales/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id, product_id, quantity, price } = req.body;

    if (!transaction_id || !product_id || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: "Fields transaction_id, product_id, quantity, and price are required.",
      });
    }

    // Get Current Sale Data
    const { data: sale, error: saleError } = await supabase
      .from("product_sales")
      .select("product_id, quantity")
      .eq("product_sales_id", id)
      .single();

    if (saleError || !sale) {
      return res.status(404).json({
        success: false,
        message: "Product sale not found.",
      });
    }

    // Get Current Product Stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock")
      .eq("products_id", product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Adjust Stock: Restore Old Quantity and Reduce New One
    const adjustedStock = product.stock + sale.quantity - quantity;
    if (adjustedStock < 0) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock + sale.quantity}, Requested: ${quantity}`,
      });
    }

    // Update Product Sale
    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
    const { data: updatedSale, error: updateSaleError } = await supabase
      .from("product_sales")
      .update({
        transaction_id,
        product_id,
        quantity,
        price,
        updated_at,
      })
      .eq("product_sales_id", id)
      .select("*");

    if (updateSaleError) {
      return res.status(400).json({
        success: false,
        message: "Failed to update product sale.",
        error: updateSaleError.message,
      });
    }

    // Update Product Stock
    const { error: updateStockError } = await supabase
      .from("products")
      .update({ stock: adjustedStock })
      .eq("products_id", product_id);

    if (updateStockError) {
      return res.status(400).json({
        success: false,
        message: "Failed to update product stock.",
        error: updateStockError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product sale updated successfully!",
      updatedSale,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating product sale.",
      error: error.message,
    });
  }
});

// Delete Product Sale (Stock Revert)
router.delete("/product-sales/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get Sale Data
    const { data: sale, error: saleError } = await supabase
      .from("product_sales")
      .select("product_id, quantity")
      .eq("product_sales_id", id)
      .single();

    if (saleError || !sale) {
      return res.status(404).json({
        success: false,
        message: "Product sale not found.",
      });
    }

    // Delete Sale
    const { error: deleteError } = await supabase
      .from("product_sales")
      .delete()
      .eq("product_sales_id", id);

    if (deleteError) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete product sale.",
        error: deleteError.message,
      });
    }

    // Restore Stock
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock")
      .eq("products_id", sale.product_id)
      .single();

    if (!productError && product) {
      const newStock = product.stock + sale.quantity;
      await supabase.from("products").update({ stock: newStock }).eq("products_id", sale.product_id);
    }

    return res.status(200).json({
      success: true,
      message: "Product sale deleted successfully, stock restored.",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting product sale.",
      error: error.message,
    });
  }
});

export default router;
