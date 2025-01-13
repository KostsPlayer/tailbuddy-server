import express from "express";
import moment from "moment";
import multer from "multer";
import authenticateToken from "../../helper/token.js";
import supabase from "./../../config/supabase.js";
import configureMiddleware from "./../../config/middleware.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/businessCategory/create", authenticateToken, upload.single("image"), async (req, res) => {
    try {
      const { name } = req.body;
      const file = req.file;
      const created_at = moment().format("YYYY-MM-DD HH:mm:ss");
  
      // Validasi input
      if (!name || !file) {
        return res.status(400).json({
          success: false,
          message: "Name and image are required.",
        });
      }
  
      // Upload gambar ke Supabase Storage
      const fileName = `business_categories/${Date.now()}-${file.originalname}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("business_categories")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });
  
      if (uploadError) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to storage.",
          error: uploadError.message,
        });
      }
  
      const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${uploadData.path}`;
  
      // Simpan data ke tabel
      const { data, error } = await supabase.from("business_categories").insert([
        {
          name,
          image: imageUrl,
          created_at,
          updated_at: created_at,
        },
      ]);
  
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Business category created successfully!",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while creating the business category.",
        error: error.message,
      });
    }
  });

  router.get("/businessCategory/all", authenticateToken, async (req, res) => {
    try {
      const { data, error } = await supabase.from("business_categories").select("*");
  
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Business categories fetched successfully!",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching business categories.",
        error: error.message,
      });
    }
  });

  router.get("/businessCategory/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
  
      const { data, error } = await supabase.from("business_categories").select("*").eq("business_categories_id", id).single();
  
      if (error) {
        return res.status(404).json({
          success: false,
          message: "Business category not found.",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Business category fetched successfully!",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while fetching the business category.",
        error: error.message,
      });
    }
  });

  router.put("/businessCategory/update/:id", authenticateToken, upload.single("image"), async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const file = req.file;
  
      const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
  
      let imageUrl;
  
      if (file) {
        // Upload gambar baru ke Supabase Storage
        const fileName = `business_categories/${Date.now()}-${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("business_categories")
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });
  
        if (uploadError) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload image to storage.",
            error: uploadError.message,
          });
        }
  
        imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${uploadData.path}`;
      }
  
      const updateData = {
        name,
        updated_at,
      };
  
      if (imageUrl) {
        updateData.image = imageUrl;
      }
  
      const { data, error } = await supabase.from("business_categories").update(updateData).eq("business_categories_id", id).single();
  
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Business category updated successfully!",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the business category.",
        error: error.message,
      });
    }
  });

  router.delete("/businessCategory/delete/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
  
      const { data, error } = await supabase.from("business_categories").delete().eq("business_categories_id", id);
  
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
  
      if (data.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Business category not found.",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Business category deleted successfully!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the business category.",
        error: error.message,
      });
    }
  });

  export default router;