import express from "express";

import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";

import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

router.post("/api/navbar-feature", authenticateToken, async (req, res) => {
  try {
    const { name, icon, className } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this resource",
      });
    }

    const { data: navbarFeature, error: insertError } = await supabase
      .from("navbar_features")
      .insert({
        name: name,
        icon: icon,
        class_name: className,
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
      message: "Navbar feature has been added",
      data: navbarFeature,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/api/navbar-feature", async (req, res) => {
  try {
    const { data: navbarFeature, error: selectError } = await supabase.from("navbar_features").select("*").order("created_at", { ascending: true });

    if (selectError) {
      console.log("Error:", selectError);
      return res.json({
        success: false,
        message: selectError.message,
      });
    }

    return res.json({
      success: true,
      message: "Navbar feature has been retrieved",
      data: navbarFeature,
    });
  } catch (error) {
    console.log("Error :", error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/api/navbar-feature-id", async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bad request: ID is required",
      });
    }

    const { data: navbarFeature, error: selectError } = await supabase.from("navbar_features").select("*").eq("navbar_feature_id", id);

    if (selectError) {
      console.log("Error:", selectError);
      return res.json({
        success: false,
        message: selectError.message,
      });
    }

    if (navbarFeature.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Navbar Feature with id = ${id} not found`,
      });
    }

    return res.json({
      success: true,
      message: "Navbar feature has been retrieved",
      data: navbarFeature,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.put("/api/navbar-feature", authenticateToken, async (req, res) => {
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

    const { name, icon, className } = req.body;

    const { data: navbarFeature, error: updateError } = await supabase
      .from("navbar_features")
      .update({
        name: name,
        icon: icon,
        class_name: className,
      })
      .eq("navbar_feature_id", id)
      .select("*");

    if (updateError) {
      console.log("Error updating navbar feature:", updateError);
      return res.json({
        success: false,
        message: updateError.message,
      });
    }

    return res.json({
      success: true,
      message: "Navbar feature has been updated",
      data: navbarFeature,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/api/navbar-feature", authenticateToken, async (req, res) => {
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

    const { data: navbarFeature, error: deleteError } = await supabase.from("navbar_features").delete().eq("navbar_feature_id", id);

    if (deleteError) {
      console.log("Error deleting navbar feature:", deleteError);
      return res.json({
        success: false,
        message: deleteError.message,
      });
    }

    return res.json({
      success: true,
      message: "Navbar feature has been deleted",
      data: navbarFeature,
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
