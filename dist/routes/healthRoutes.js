"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    let dbStatus = false;
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        dbStatus = true;
    }
    catch (err) {
        dbStatus = false;
    }
    res.json({
        status: 'ok',
        postgres: dbStatus,
        orm: 'Prisma',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
