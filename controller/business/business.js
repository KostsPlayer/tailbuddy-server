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

// Create a new business
router.post("/business", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { business, business_category_id } = req.body;

    // Handle image upload
    let imageName = null;
    if (req.file) {
      const { originalname, buffer } = req.file;
      const fileExt = originalname.split(".").pop();
      imageName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("business")
        .upload(`business_images/${imageName}`, buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
    }

    const { data: newBusiness, error: insertError } = await supabase
      .from("business")
      .insert({
        business,
        business_category_id,
        image: imageName,
      })
      .select("*");

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({
        success: false,
        message: insertError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business has been added",
      data: newBusiness,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retrieve all businesses
router.get("/business", async (req, res) => {
  try {
    const { data: businesses, error: getError } = await supabase
      .from("business")
      .select("*")
      .order("created_at", { ascending: true });

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Businesses have been retrieved",
      data: businesses,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retrieve business by ID
router.get("/business-id", async (req, res) => {
  try {
    const { id } = req.query;

    const { data: business, error: getError } = await supabase
      .from("business")
      .select("*")
      .eq("business_id", id);

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    if (!business.length) {
      return res.status(404).json({
        success: false,
        message: `Business with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business has been retrieved",
      data: business,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update business by ID
router.put("/business", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.query;
    const { business, business_category_id } = req.body;

    // Handle image upload
    let imageName = null;
    if (req.file) {
      const { originalname, buffer } = req.file;
      const fileExt = originalname.split(".").pop();
      imageName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("your-bucket-name") // Replace with your bucket name
        .upload(`business_images/${imageName}`, buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
    }

    const { data: updatedBusiness, error: updateError } = await supabase
      .from("business")
      .update({
        business,
        business_category_id,
        ...(imageName && { image: imageName }),
      })
      .eq("business_id", id)
      .select("*");

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({
        success: false,
        message: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business has been updated",
      data: updatedBusiness,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete business by ID
router.delete("/business", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    const { data: deletedBusiness, error: deleteError } = await supabase
      .from("business")
      .delete()
      .eq("business_id", id)
      .select("*");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({
        success: false,
        message: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business has been deleted",
      data: deletedBusiness,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;