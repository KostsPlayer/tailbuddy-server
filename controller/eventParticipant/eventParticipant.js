import express from "express";
import supabase from "../../config/supabase.js";
import authenticateToken from "../../helper/token.js";
import moment from "moment";

const router = express.Router();

// 🔹 Tambah Peserta Event
router.post("/event-participants", authenticateToken, async (req, res) => {
  try {
    const { user_id, transaction_id, business_id } = req.body;

    if (!user_id || !transaction_id || !business_id) {
      return res.status(400).json({
        success: false,
        message: "Fields user_id, transaction_id, and business_id are required.",
      });
    }

    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const { data, error } = await supabase.from("event_participants").insert([{ user_id, transaction_id, business_id, created_at, updated_at }]).select("*");

    if (error) {
      return res.status(400).json({ success: false, message: "Failed to register participant.", error });
    }

    return res.status(201).json({ success: true, message: "Participant registered successfully!", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// 🔹 Ambil Semua Peserta Event
router.get("/event-participants", async (req, res) => {
  try {
    const { data, error } = await supabase.from("event_participants").select("*");

    if (error) {
      return res.status(400).json({ success: false, message: "Failed to fetch participants.", error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// 🔹 Ambil Detail Peserta Event Berdasarkan ID
router.get("/event-participants/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("event_participants").select("*").eq("event_participants_id", id).single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Participant not found." });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// 🔹 Update Data Peserta Event
router.put("/event-participants/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, transaction_id, business_id } = req.body;

    if (!user_id || !transaction_id || !business_id) {
      return res.status(400).json({
        success: false,
        message: "Fields user_id, transaction_id, and business_id are required.",
      });
    }

    const updated_at = new Date().toISOString();

    const { data, error } = await supabase.from("event_participants").update({ user_id, transaction_id, business_id, updated_at }).eq("event_participants_id", id).select("*");

    if (error) {
      return res.status(400).json({ success: false, message: "Failed to update participant.", error });
    }

    return res.status(200).json({ success: true, message: "Participant updated successfully!", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// 🔹 Hapus Peserta Event
router.delete("/event-participants/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from("event_participants").delete().eq("event_participants_id", id).select("*");

    if (error) {
      return res.status(400).json({ success: false, message: "Failed to delete participant.", error });
    }

    return res.status(200).json({ success: true, message: "Participant deleted successfully!", data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

export default router;
