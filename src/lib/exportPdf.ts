import { jsPDF } from 'jspdf';
import { toCanvas } from 'html-to-image';

export interface PdfExportOptions {
  filename?: string;
  hiddenSections?: string[];
  title?: string;
  projectNumber?: string;
  engineer?: string;
  printMode?: boolean;
}

export const exportElementToPdf = async (
  elementId: string,
  filenameOrOptions: string | PdfExportOptions = 'design_report.pdf'
) => {
  const options: PdfExportOptions = typeof filenameOrOptions === 'string'
    ? { filename: filenameOrOptions }
    : filenameOrOptions;

  const filename = options.filename || 'design_report.pdf';
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const isPrintMode = !!options.printMode;
  if (isPrintMode) {
    element.classList.add('pdf-print-mode');
    element.classList.add('app-theme-light');
    document.body.classList.add('pdf-print-mode');
  }

  // Hide any sections requested to be excluded in the PDF configuration
  const hiddenElements: { el: HTMLElement; prevDisplay: string }[] = [];
  if (options.hiddenSections && options.hiddenSections.length > 0) {
    options.hiddenSections.forEach(sectionKey => {
      const matched = element.querySelectorAll<HTMLElement>(`[data-pdf-section="${sectionKey}"]`);
      matched.forEach(el => {
        hiddenElements.push({ el, prevDisplay: el.style.display });
        el.style.display = 'none';
      });
    });
  }

  // Safely disable any cross-origin stylesheets during capture to prevent CORS cssRules access errors
  const crossOriginLinks: { link: HTMLLinkElement; prevDisabled: boolean }[] = [];
  document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach(link => {
    try {
      if (link.href) {
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) {
          crossOriginLinks.push({ link, prevDisabled: link.disabled });
          link.disabled = true;
        }
      }
    } catch {
      // ignore
    }
  });

  try {
    // Allow brief tick for DOM styles to settle before canvas rendering
    await new Promise(resolve => setTimeout(resolve, 60));

    const canvas = await toCanvas(element, {
      pixelRatio: 2, // Higher scale for high resolution print quality
      backgroundColor: isPrintMode ? '#ffffff' : '#0f172a',
      skipFonts: true, // Prevents html-to-image from traversing external stylesheets or failing on remote font fetches
      filter: (node) => {
        // Exclude cross-origin stylesheets or scripts from SVG cloning
        if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
          try {
            const url = new URL(node.href, window.location.href);
            if (url.origin !== window.location.origin) return false;
          } catch {
            return false;
          }
        }
        return true;
      }
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate the height of the image in the PDF based on the A4 width
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add subsequent pages if the content is taller than one A4 page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    if (isPrintMode) {
      element.classList.remove('pdf-print-mode');
      element.classList.remove('app-theme-light');
      document.body.classList.remove('pdf-print-mode');
    }
    // Restore cross-origin stylesheet states
    crossOriginLinks.forEach(({ link, prevDisabled }) => {
      link.disabled = prevDisabled;
    });
    // Restore all hidden elements immediately to guarantee pristine UI state
    hiddenElements.forEach(({ el, prevDisplay }) => {
      el.style.display = prevDisplay;
    });
  }
};
