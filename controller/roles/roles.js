import express from "express";
import configureMiddleware from "../../config/middleware.js";
import supabase from "../../config/supabase.js";
import authenticateToken from "../../helper/token.js";

const app = express();
configureMiddleware(app);
const router = express.Router();

// Create a new role
router.post("/role", authenticateToken, async (req, res) => {
  try {
    const { role, icon, desc } = req.body;

    const { data: newRole, error: insertError } = await supabase
      .from("roles")
      .insert({
        role,
        icon,
        desc,
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
      message: "Role has been added",
      data: newRole,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retrieve all roles
router.get("/role", async (req, res) => {
  try {
    const { data: roles, error: getError } = await supabase
      .from("roles")
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
      message: "Roles have been retrieved",
      data: roles,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retrieve role by ID
router.get("/role/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: role, error: getError } = await supabase
      .from("roles")
      .select("*")
      .eq("roles_id", id);

    if (getError) {
      console.error("Get error:", getError);
      return res.status(500).json({
        success: false,
        message: getError.message,
      });
    }

    if (!role.length) {
      return res.status(404).json({
        success: false,
        message: `Role with ID ${id} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role has been retrieved",
      data: role,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update role by ID
router.put("/role/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, icon, desc } = req.body;

    const { data: updatedRole, error: updateError } = await supabase
      .from("roles")
      .update({
        role,
        icon,
        desc,
      })
      .eq("roles_id", id)
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
      message: "Role has been updated",
      data: updatedRole,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete role by ID
router.delete("/role/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deletedRole, error: deleteError } = await supabase
      .from("roles")
      .delete()
      .eq("roles_id", id)
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
      message: "Role has been deleted",
      data: deletedRole,
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
