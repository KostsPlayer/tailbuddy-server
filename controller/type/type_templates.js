import express from "express";

import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";

import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/type-templates", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { type, icon, nameClass } = req.body;

    const { data: typeTemplate, error: insertError } = await supabase
      .from("type_templates")
      .insert({
        type: type,
        icon: icon,
        name_class: nameClass,
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
      message: "Type has been added",
      data: typeTemplate,
    });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/type-templates", async (req, res) => {
  try {
    const { data: typeTemplates, error: selectError } = await supabase.from("type_templates").select("*").order("created_at", { ascending: true });

    if (selectError) {
      console.error("Select error:", selectError);
      return res.status(500).json({
        success: false,
        message: selectError.message,
      });
    }

    const footerItems = typeTemplates.filter((item) => item.type === "Footer");
    const otherItems = typeTemplates.filter((item) => item.type !== "Footer");

    // Gabungkan data lainnya dengan footer di bagian akhir
    const sortedData = [...otherItems, ...footerItems];

    return res.status(200).json({
      success: true,
      data: sortedData,
    });
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/api/type-templates-id", async (req, res) => {
  const { id } = req.query;

  // Memastikan ID disediakan dan valid
  if (!id) {
    return res.status(400).json({ success: false, message: "ID is required" });
  }

  try {
    // Ambil data dari Supabase berdasarkan ID
    const { data: item, error } = await supabase.from("type_templates").select("*").eq("type_template_id", id).single();

    // Tangani kesalahan yang terjadi saat query ke Supabase
    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ success: false, message: "Database query error" });
    }

    // Jika data tidak ditemukan
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Mengembalikan data jika ditemukan
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/api/type-templates", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    // Memastikan ID disediakan dan valid
    if (!id) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }

    const { type, icon, nameClass } = req.body;

    const { data: typeTemplate, error: updateError } = await supabase
      .from("type_templates")
      .update({
        type: type,
        icon: icon,
        name_class: nameClass,
      })
      .eq("type_template_id", id)
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
      message: "Type has been updated",
      data: typeTemplate,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/api/type-templates", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    // Memastikan ID disediakan dan valid
    if (!id) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }

    const { data: typeTemplate, error: deleteError } = await supabase.from("type_templates").delete().eq("type_template_id", id).select("*");

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return res.status(500).json({
        success: false,
        message: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Type has been deleted",
      data: typeTemplate,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
