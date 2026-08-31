"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middlewares/upload");
const uploadController_1 = require("../controllers/uploadController");
const router = (0, express_1.Router)();
// POST /api/upload (or POST /api/upload/images)
router.post('/', upload_1.uploadProductImages, uploadController_1.UploadController.uploadImages);
exports.default = router;
