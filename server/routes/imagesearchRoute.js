const express = require("express");
const multer = require("multer");
const { searchByImage } = require("../controllers/imagesearchcontroller");

const router = express.Router();
const upload = multer();

router.post("/search-by-image", upload.single("file"), searchByImage);

module.exports = router;
