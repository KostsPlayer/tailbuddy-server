import express from "express";
import multer from "multer";
import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";
import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

// Setup multer for image upload
const upload = multer({ storage: multer.memoryStorage() });

// Create a new product
router.post("/products", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { name, price } = req.body;
    let imageName = null;

    if (req.file) {
      const { originalname, buffer } = req.file;
      imageName = `${Date.now()}-${originalname}`;

      const { error: uploadError } = await supabase.storage.from("products").upload(imageName, buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

      if (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
    }

    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert({
        name,
        price,
        image: imageName,
      })
      .select("*");

    if (insertError) {
      return res.status(500).json({ success: false, message: insertError.message });
    }

    res.status(200).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Retrieve all products
router.get("/products", async (req, res) => {
  try {
    const { data: products, error } = await supabase.from("products").select("*").order("created_at", { ascending: true });
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Retrieve product by ID
router.get("/product-id", async (req, res) => {
  try {
    const { id } = req.query;
    const { data: product, error } = await supabase.from("products").select("*").eq("product_id", id).single();
    if (error || !product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update product by ID
router.put("/products", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.query;
    const { name, price } = req.body;
    let imageName = null;

    if (req.file) {
      const { originalname, buffer } = req.file;
      imageName = `${Date.now()}-${originalname}`;

      const { error: uploadError } = await supabase.storage.from("products").upload(imageName, buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

      if (uploadError) {
        return res.status(500).json({ success: false, message: "Image upload failed" });
      }
    }

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({ name, price, ...(imageName && { image: imageName }) })
      .eq("product_id", id)
      .select("*");

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    res.status(200).json({ success: true, message: "Product updated successfully", data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete product by ID
router.delete("/products", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;
    const { data: productData, error: productError } = await supabase.from("products").select("image").eq("product_id", id).single();
    if (productError || !productData) return res.status(404).json({ success: false, message: "Product not found" });

    if (productData.image) {
      const { error: deleteImageError } = await supabase.storage.from("products").remove([productData.image]);
      if (deleteImageError) return res.status(500).json({ success: false, message: "Failed to delete image" });
    }

    const { data: deletedProduct, error: deleteError } = await supabase.from("products").delete().eq("product_id", id).select("*");
    if (deleteError) return res.status(500).json({ success: false, message: deleteError.message });

    res.status(200).json({ success: true, message: "Product deleted successfully", data: deletedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
