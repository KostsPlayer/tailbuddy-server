import express from "express";
import moment from "moment";
import multer from "multer"; // Untuk menangani upload file
import supabase from "./../../config/supabase.js";
import configureMiddleware from "./../../config/middleware.js";
import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

// Konfigurasi multer untuk upload file
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/pets/create", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { pet, location, price, petCategory } = req.body;
    const file = req.file; // File gambar yang diupload
    const created_at = moment().format("YYYY-MM-DD HH:mm:ss");

    // Ambil user_id dari token JWT
    const user_id = req.user.user_id; // `user_id` dari payload token

    // Validasi input
    if (!pet || !file || !location || !price|| !petCategory) {
      return res.status(400).json({
        success: false,
        message: "All fields are required, including an image.",
      });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number.",
      });
    }

    // Upload gambar ke Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("pets") // Nama bucket
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to storage.",
        error: uploadError.message,
      });
    }

    // Generate URL untuk gambar
    const image = uploadData.path;

    // Simpan data ke tabel `pets`
    const { data, error } = await supabase.from("pets").insert([
      {
        pet,
        image: image,
        location,
        price,
        user_id,
        created_at,
        updated_at: created_at,
        pet_category_id: petCategory,
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
      message: "Pet created successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the pet.",
      error: error.message,
    });
  }
});

router.get("/pets/all", async (req, res) => {
  try {
    const { data, error } = await supabase.from("pets").select(`*, pet_categories(*)`);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pets fetched successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching pets.",
      error: error.message,
    });
  }
});

router.get("/pets/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("pets").select(`*, pet_categories(*)`).eq("pets_id", id).single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pet fetched successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the pet.",
      error: error.message,
    });
  }
});

router.put("/pets/update/:id", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { pet, location, price, petCategory } = req.body;
    const file = req.file;

    const updated_at = moment().format("YYYY-MM-DD HH:mm:ss");

    let image;

    if (file) {
      // Upload gambar baru ke Supabase Storage
      const fileName = `pets/${Date.now()}-${file.originalname}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from("pets").upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to storage.",
          error: uploadError.message,
        });
      }

      image = uploadData.path;
    }

    // Update data di tabel `pets`
    const updateData = {
      pet,
      location,
      price,
      updated_at,
      pet_category_id: petCategory,
    };

    if (image) {
      updateData.image = image;
    }

    const { data, error } = await supabase.from("pets").update(updateData).eq("pets_id", id).select('*').single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pet updated successfully!",
      data,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the pet.",
      error: error.message,
    });
  }
});

router.delete("/pets/delete/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil data pet untuk mendapatkan path gambar sebelum menghapusnya
    const { data: petData, error: petError } = await supabase.from("pets").select("image").eq("pets_id", id).single();

    if (petError || !petData) {
      return res.status(404).json({
        success: false,
        message: "Pet not found.",
      });
    }

    const imagePath = petData.image;

    // Hapus gambar dari Supabase Storage jika ada
    if (imagePath) {
      const { error: deleteImageError } = await supabase.storage.from("pets").remove([imagePath]);

      if (deleteImageError) {
        console.error("Failed to delete image:", deleteImageError);
        return res.status(500).json({
          success: false,
          message: "Failed to delete image from storage.",
          error: deleteImageError.message,
        });
      }
    }

    // Hapus data dari tabel `pets`
    const { data, error } = await supabase.from("pets").delete().eq("pets_id", id);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pet and associated image deleted successfully!",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the pet.",
      error: error.message,
    });
  }
});

export default router;
