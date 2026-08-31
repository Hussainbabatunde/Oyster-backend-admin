import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  let dbStatus = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = true;
  } catch (err) {
    dbStatus = false;
  }

  res.json({
    status: 'ok',
    postgres: dbStatus,
    orm: 'Prisma',
    timestamp: new Date().toISOString(),
  });
});

export default router;
