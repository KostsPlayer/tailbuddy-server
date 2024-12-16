import express from "express";

import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";

import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/navbar-layout", authenticateToken, async (req, res) => {
  try {
    const { className, features } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { data: navbarLayout, error: insertError } = await supabase
      .from("navbar_layouts")
      .insert({
        class_name: className,
        features: features,
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
      message: "Navbar layout has been added",
      data: navbarLayout,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/api/navbar-layout", async (req, res) => {
  try {
    const { data: navbarLayout, error: selectError } = await supabase.from("navbar_layouts").select("*").order("created_at", { ascending: true });

    if (selectError) {
      console.log("Error:", selectError);
      return res.json({
        success: false,
        message: selectError.message,
      });
    }

    return res.json({
      success: true,
      message: "Navbar layout has been retrieved",
      data: navbarLayout,
    });
  } catch (error) {
    console.log("Error :", error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/api/navbar-layout-id", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: navbarLayout, error: selectError } = await supabase.from("navbar_layouts").select("*").eq("navbar_layout_id", id);

    if (selectError) {
      console.log("Error:", selectError);
      return res.json({
        success: false,
        message: selectError.message,
      });
    }

    if (navbarLayout.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Navbar layout with id = ${id} not found`,
      });
    }

    return res.json({
      success: true,
      message: "Navbar layout has been retrieved",
      data: navbarLayout,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/api/navbar-layout", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      console.log("Bad request: ID is required");
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { className, features } = req.body;

    const { data: navbarLayout, error: updateError } = await supabase
      .from("navbar_layouts")
      .update({
        class_name: className,
        features: features,
      })
      .eq("navbar_layout_id", id)
      .select("*");

    if (updateError) {
      console.log("Error updating navbar layout:", updateError);
      return res.json({
        success: false,
        message: updateError.message,
      });
    }

    return res.json({
      success: true,
      message: "Navbar layout has been updated",
      data: navbarLayout,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/api/navbar-layout", authenticateToken, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { data: navbarLayout, error: deleteError } = await supabase.from("navbar_layouts").delete().eq("navbar_layout_id", id);

    if (deleteError) {
      console.log("Error deleting navbar layout:", deleteError);
      return res.json({
        success: false,
        message: deleteError.message,
      });
    }

    return res.json({
      success: true,
      message: "Navbar layout has been deleted",
    });
  } catch (error) {
    console.log("Error:", error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

export default router;
