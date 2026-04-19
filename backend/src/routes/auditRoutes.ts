import express from 'express';
import { generateCivicAuditPDF } from '../controllers/auditController';

const router = express.Router();

router.get('/pdf/:constituencyId', generateCivicAuditPDF);

export default router;
