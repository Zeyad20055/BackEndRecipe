const express = require("express");
const router = express.Router();
const Recipe = require("../Models/RecipeSchema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const verifyToken = require("../middleware/auth.middleware");

const dir = path.join(__dirname, "../Public/Images");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../Public/Images"));
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("coverImage"), verifyToken, async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;

    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newRecipe = await Recipe.create({
      title,
      ingredients,
      instructions,
      coverImage: req.file ? req.file.filename : "",
      createdBy: req.user._id,
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ لازم يكون قبل /:id
router.get("/myrecipes", verifyToken, async (req, res) => {
  try {
    const recipes = await Recipe.find({ createdBy: req.user._id });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", verifyToken, upload.single("coverImage"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ingredients, instructions } = req.body;

    const updateData = {
      title,
      instructions,
    };

    if (ingredients) {
      updateData.ingredients = Array.isArray(ingredients) ? ingredients : ingredients.split(",");
    }

    if (req.file) {
      updateData.coverImage = req.file.filename;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedRecipe) {
      return res.status(404).json({
        error: "Recipe not found",
      });
    }

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
});
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(200).json(deletedRecipe);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
