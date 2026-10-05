"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../controllers/customerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authenticateToken, customerController_1.CustomerController.getAll);
router.get('/:id', authMiddleware_1.authenticateToken, customerController_1.CustomerController.getById);
exports.default = router;
