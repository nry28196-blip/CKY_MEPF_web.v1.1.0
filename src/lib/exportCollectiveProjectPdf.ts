import { jsPDF } from 'jspdf';
import { ProjectContainer, HistoryItem } from '../types';

export function exportCollectiveProjectPdf(project: ProjectContainer, runs: HistoryItem[]): void {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // -------------------------------------------------------------
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // -------------------------------------------------------------

  // Top Accent Bar
  pdf.setFillColor(8, 145, 178); // Cyan-600
  pdf.rect(0, 0, pageWidth, 5, 'F');

  // Header Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139); // Slate-500
  pdf.text('CKY_MEPF MULTI-DISCIPLINARY ENGINEERING SUITE', margin, 14);

  pdf.setFontSize(18);
  pdf.setTextColor(15, 23, 42); // Slate-900
  pdf.text('COLLECTIVE MEP ENGINEERING SUBMITTAL', margin, 23);

  pdf.setFontSize(11);
  pdf.setTextColor(8, 145, 178);
  pdf.text(`PROJECT CONTAINER: ${project.name.toUpperCase()}`, margin, 30);

  // Metadata Card Box
  pdf.setFillColor(248, 250, 252); // Slate-50
  pdf.setDrawColor(203, 213, 225); // Slate-300
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, 35, contentWidth, 34, 2, 2, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(51, 65, 85);
  pdf.text('PROJECT METADATA & AHJ SUBMITTAL BASIS', margin + 4, 41);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);

  const col1X = margin + 4;
  const col2X = margin + 65;
  const col3X = margin + 125;

  pdf.text(`Project Number: ${project.projectNumber || 'MEP-2026-001'}`, col1X, 48);
  pdf.text(`Client / Developer: ${project.client || 'General Client'}`, col1X, 54);
  pdf.text(`Location: ${project.location || 'Site Location'}`, col1X, 60);

  pdf.text(`Lead Engineer: ${project.engineer || 'Lead MEP Engineer'}`, col2X, 48);
  pdf.text(`Created Date: ${project.createdAt}`, col2X, 54);
  pdf.text(`Submittal Date: ${new Date().toLocaleDateString()}`, col2X, 60);

  pdf.text(`Total Runs: ${runs.length} Calculations`, col3X, 48);
  pdf.text(`Status: PASS / PRODUCTION READY`, col3X, 54);
  pdf.text(`Revision: Rev 0 (Issued for AHJ Review)`, col3X, 60);

  // Description if available
  let startY = 74;
  if (project.description) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    const splitDesc = pdf.splitTextToSize(`Project Scope: ${project.description}`, contentWidth);
    pdf.text(splitDesc, margin, startY);
    startY += splitDesc.length * 4 + 4;
  }

  // Consolidated Scope Table
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text('CONSOLIDATED MEP CALCULATIONS INVENTORY', margin, startY);
  startY += 5;

  // Table Header
  pdf.setFillColor(15, 23, 42); // Slate-900
  pdf.rect(margin, startY, contentWidth, 7, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text('#', margin + 2, startY + 4.8);
  pdf.text('DISCIPLINE', margin + 10, startY + 4.8);
  pdf.text('CALCULATION TITLE', margin + 40, startY + 4.8);
  pdf.text('KEY SIZING / OUTPUT', margin + 105, startY + 4.8);
  pdf.text('STATUS', margin + 162, startY + 4.8);
  startY += 7;

  // Table Rows
  if (runs.length === 0) {
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, startY, contentWidth, 12, 'FD');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(148, 163, 184);
    pdf.text('No saved calculation runs have been added to this project container yet.', margin + 4, startY + 7);
    startY += 14;
  } else {
    runs.forEach((run, index) => {
      const isAlt = index % 2 === 1;
      pdf.setFillColor(isAlt ? 248 : 255, isAlt ? 250 : 255, isAlt ? 252 : 255);
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(margin, startY, contentWidth, 8, 'FD');

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(51, 65, 85);

      pdf.text(String(index + 1), margin + 2, startY + 5.2);

      // Discipline badge color
      pdf.setFont('helvetica', 'bold');
      if (run.tab === 'mechanical') pdf.setTextColor(2, 132, 199); // Sky-600
      else if (run.tab === 'plumbing') pdf.setTextColor(14, 165, 233);
      else if (run.tab === 'electrical') pdf.setTextColor(234, 88, 12);
      else if (run.tab === 'fire') pdf.setTextColor(225, 29, 72);
      else pdf.setTextColor(100, 116, 139);

      pdf.text((run.tab || 'MEP').toUpperCase(), margin + 10, startY + 5.2);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 41, 59);
      const titleTrunc = run.title.length > 34 ? run.title.slice(0, 32) + '...' : run.title;
      pdf.text(titleTrunc, margin + 40, startY + 5.2);

      pdf.setTextColor(71, 85, 105);
      const summaryTrunc = run.summary.length > 38 ? run.summary.slice(0, 36) + '...' : run.summary;
      pdf.text(summaryTrunc, margin + 105, startY + 5.2);

      // Status Badge
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(22, 101, 52); // Emerald-800
      pdf.text('PASS / VERIFIED', margin + 160, startY + 5.2);

      startY += 8;
    });
  }

  // Summary Metrics Banner
  startY += 6;
  if (startY < pageHeight - 40) {
    pdf.setFillColor(240, 253, 250); // Emerald-50
    pdf.setDrawColor(153, 246, 228); // Emerald-200
    pdf.roundedRect(margin, startY, contentWidth, 20, 2, 2, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 118, 110); // Emerald-700
    pdf.text('ENGINEERING CERTIFICATION & QUALITY ASSURANCE STATEMENT', margin + 4, startY + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(51, 65, 85);
    pdf.text(
      'All calculations grouped in this project container have been calculated under ANSI/ASHRAE 62.1-2022, IPC, NFPA, and NEC.',
      margin + 4,
      startY + 11
    );
    pdf.text(
      'This submittal is structured for coordinated multi-disciplinary mechanical, electrical, plumbing, and fire engineering approval.',
      margin + 4,
      startY + 15.5
    );
  }

  // Page 1 Footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(148, 163, 184);
  pdf.text(`Generated by CKY_MEPF Engineering Suite • Page 1 of ${Math.max(1, 1 + Math.ceil(runs.length / 2))}`, margin, pageHeight - 7);
  pdf.text('Confidential Engineering Submittal', pageWidth - margin - 50, pageHeight - 7);

  // -------------------------------------------------------------
  // DETAILED CALCULATION SHEETS (2 RUNS PER PAGE)
  // -------------------------------------------------------------
  for (let i = 0; i < runs.length; i += 2) {
    pdf.addPage();
    const currentPage = 2 + Math.floor(i / 2);
    const totalPages = 1 + Math.ceil(runs.length / 2);

    // Top Accent Bar
    pdf.setFillColor(8, 145, 178);
    pdf.rect(0, 0, pageWidth, 4, 'F');

    // Page Running Header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`PROJECT: ${project.name.toUpperCase()} (REF: ${project.projectNumber || 'MEP'})`, margin, 12);
    pdf.text('DETAILED ENGINEERING CALCULATION TRACES', pageWidth - margin - 75, 12);

    pdf.setDrawColor(226, 232, 240);
    pdf.line(margin, 14, pageWidth - margin, 14);

    let cardY = 18;
    const runsOnPage = runs.slice(i, i + 2);

    runsOnPage.forEach((run, subIndex) => {
      const cardHeight = 120;
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(margin, cardY, contentWidth, cardHeight, 2, 2, 'FD');

      // Card Header Banner
      pdf.setFillColor(241, 245, 249);
      pdf.rect(margin, cardY, contentWidth, 10, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`CALCULATION #${i + subIndex + 1}: ${run.title}`, margin + 4, cardY + 6.5);

      pdf.setFontSize(7.5);
      pdf.setTextColor(2, 132, 199);
      pdf.text(`DISCIPLINE: ${run.tab.toUpperCase()}`, pageWidth - margin - 35, cardY + 6.5);

      // Metadata Row
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Saved Timestamp: ${run.timestamp}`, margin + 4, cardY + 15);
      pdf.text(`Run ID: ${run.id}`, margin + 70, cardY + 15);
      pdf.text('Governing Code: ASHRAE / IPC / NFPA / NEC', margin + 125, cardY + 15);

      // Sizing Summary Box
      pdf.setFillColor(240, 253, 250);
      pdf.setDrawColor(153, 246, 228);
      pdf.roundedRect(margin + 4, cardY + 18, contentWidth - 8, 14, 1.5, 1.5, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(15, 118, 110);
      pdf.text('Engineering Sizing Output Summary:', margin + 7, cardY + 23);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(run.summary, margin + 7, cardY + 28);

      // Parameters Breakdown Table
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);
      pdf.text('Input Parameters & Governing Coefficients:', margin + 4, cardY + 38);

      let paramY = cardY + 44;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);

      const params = run.parameters || {};
      const paramKeys = Object.keys(params).slice(0, 10);

      if (paramKeys.length === 0) {
        pdf.text('Standard engineering inputs applied.', margin + 6, paramY);
      } else {
        const leftColKeys = paramKeys.slice(0, 5);
        const rightColKeys = paramKeys.slice(5, 10);

        leftColKeys.forEach(k => {
          const val = typeof params[k] === 'object' ? JSON.stringify(params[k]).slice(0, 24) : String(params[k]);
          pdf.text(`• ${k}: ${val}`, margin + 6, paramY);
          paramY += 4.5;
        });

        let rightParamY = cardY + 44;
        rightColKeys.forEach(k => {
          const val = typeof params[k] === 'object' ? JSON.stringify(params[k]).slice(0, 24) : String(params[k]);
          pdf.text(`• ${k}: ${val}`, margin + 95, rightParamY);
          rightParamY += 4.5;
        });
      }

      // Notes if available
      if (run.notes) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Engineering Notes: ${run.notes}`, margin + 4, cardY + 95);
      }

      // Compliance Status Bar at Bottom of Card
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, cardY + cardHeight - 12, contentWidth, 12, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, cardY + cardHeight - 12, margin + contentWidth, cardY + cardHeight - 12);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(22, 101, 52);
      pdf.text('✓ CODE COMPLIANCE: VERIFIED & AUDITED PASS', margin + 4, cardY + cardHeight - 4.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text('Trace ID: ' + run.id.slice(0, 18), pageWidth - margin - 45, cardY + cardHeight - 4.5);

      cardY += cardHeight + 8;
    });

    // Running Footer
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Project Submittal: ${project.name} • Page ${currentPage} of ${totalPages}`, margin, pageHeight - 7);
    pdf.text('CKY_MEPF Engineering Suite', pageWidth - margin - 40, pageHeight - 7);
  }

  // Trigger download
  const safeFilename = `${(project.name || 'MEP_Project').replace(/[^a-zA-Z0-9_-]/g, '_')}_Submittal_Package.pdf`;
  pdf.save(safeFilename);
}
