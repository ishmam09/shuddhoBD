import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { Seat } from '../models/Seat';
import Project from '../models/Project';
import Report from '../models/Report';

export const generateCivicAuditPDF = async (req: Request, res: Response) => {
  try {
    const { constituencyId } = req.params;
    const seatIdNum = Number(constituencyId);

    // Fetch data
    const constituency = await Seat.findOne({ order: seatIdNum });
    if (!constituency) {
      res.status(404).json({ message: 'Constituency not found' });
      return;
    }

    const projects = await Project.find({ seatId: seatIdNum });
    const reports  = await Report.find({ seatId: seatIdNum });

    // Set headers FIRST before anything else
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="CivicAudit_${constituency.seatName.replace(/\s+/g, '_')}.pdf"`
    );

    // Create PDF and pipe directly to res
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // --- PAGE CONTENT ---

    // Header
    doc.fontSize(22).font('Helvetica-Bold').text('Civic Audit Report', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text(constituency.seatName, { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Constituency Overview
    doc.fontSize(16).font('Helvetica-Bold').text('Constituency Overview');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Representative: ${constituency.mpName}`);
    doc.text(`Party: ${constituency.party}`);
    doc.text(`Division: ${constituency.division}`);
    doc.text(`Seat Number: ${constituency.order}`);
    doc.text(`Total Allocated Budget: ${constituency.budgetAllocation ?? 'N/A'}% of Divisional Fund`);
    doc.moveDown(1.5);

    // Projects Table
    doc.fontSize(16).font('Helvetica-Bold').text('Development Projects');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    if (projects.length === 0) {
      doc.fontSize(11).font('Helvetica').text('No projects found.');
    } else {
      projects.forEach((p, i) => {
        const actualSpending = (p.phases || []).reduce((sum, ph) => sum + (ph.spent || 0), 0);
        doc.fontSize(11).font('Helvetica-Bold').text(`${i + 1}. ${p.name}`);
        doc.font('Helvetica').fontSize(10);
        doc.text(`   Manager: ${p.manager}`);
        doc.text(`   Allocated: ${p.budget.toLocaleString()} BDT | Spent: ${actualSpending.toLocaleString()} BDT`);
        doc.text(`   Completion: ${p.actualCompletion}% | Status: ${p.status}`);
        doc.text(`   Location: ${p.location}`);
        doc.moveDown(0.5);
      });
    }
    doc.moveDown(1);

    // Budget Analysis
    const totalAllocated = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent     = projects.reduce((sum, p) =>
      sum + (p.phases || []).reduce((s, ph) => s + (ph.spent || 0), 0), 0);
    const discrepancy    = totalAllocated - totalSpent;

    doc.fontSize(16).font('Helvetica-Bold').text('Budget Analysis');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Allocated: ${totalAllocated.toLocaleString()} BDT`);
    doc.text(`Total Spent:     ${totalSpent.toLocaleString()} BDT`);
    if (discrepancy > 0)       doc.text(`Remaining Balance: ${discrepancy.toLocaleString()} BDT`);
    else if (discrepancy < 0)  doc.text(`Budget Overrun: ${Math.abs(discrepancy).toLocaleString()} BDT  ⚠`);
    else                       doc.text('Budget matched exactly.');
    doc.moveDown(1.5);

    // Reports Summary
    doc.fontSize(16).font('Helvetica-Bold').text('Citizen Reports Summary');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total Reports: ${reports.length}`);

    const byCategory: Record<string, number> = {};
    reports.forEach((r: any) => {
      const cat = r.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    const categories = ['Budget Misuse', 'Infrastructure Delay', 'Asset Discrepancy'];
    categories.forEach(cat => {
      doc.text(`${cat}: ${byCategory[cat] || 0}`);
    });

    const highSeverity = reports.filter((r: any) => r.severity === 'High').length;
    doc.text(`High Severity Reports: ${highSeverity}`);
    doc.moveDown(1.5);

    // Civic Trust Score
    const verified      = reports.filter((r: any) => r.status === 'Verified');
    const solved        = verified.filter((r: any) => r.resolution === 'Solved').length;
    const ongoing       = verified.filter((r: any) => r.resolution === 'Ongoing').length;
    const total         = reports.length;
    let ctiScore        = 100;
    if (total > 0) ctiScore = Math.round(Math.max(0, ((solved + ongoing * 0.5) / total) * 100));
    const ctiStatus     = ctiScore >= 70 ? 'Good' : ctiScore >= 40 ? 'Moderate' : 'Critical';

    doc.fontSize(16).font('Helvetica-Bold').text('Civic Trust Score (CTI)');
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(28).font('Helvetica-Bold').text(`${ctiScore} / 100`, { align: 'center' });
    doc.fontSize(13).font('Helvetica').text(`Status: ${ctiStatus}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#555555');
    doc.text(`Contributing factors: ${solved} resolved, ${ongoing} ongoing out of ${total} total reports.`);
    doc.moveDown(2);

    // Footer
    doc.fontSize(9).font('Helvetica').fillColor('#888888')
      .text(
        'Generated by ShuddhoBD | Data sourced from public records',
        50, doc.page.height - 40,
        { align: 'center', width: doc.page.width - 100 }
      );

    // IMPORTANT: end the document — this finalizes and flushes to res
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    // Only send error if headers not already sent
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF' });
    }
  }
};
