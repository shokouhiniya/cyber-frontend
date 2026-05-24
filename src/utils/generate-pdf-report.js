import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a PDF from HTML content.
 * Uses a custom page size that matches the content exactly — no page breaks,
 * no side cutting. The PDF is one continuous page (like a web page).
 */
export async function generatePdfFromHtml(htmlContent, filename = 'report') {
  const RENDER_WIDTH = 800; // px — the HTML render width

  // Create off-screen container
  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    top: 0;
    left: -9999px;
    width: ${RENDER_WIDTH}px;
    padding: 0;
    background: white;
    font-family: 'Vazirmatn', 'IRANSans', Tahoma, sans-serif;
    direction: rtl;
    overflow: visible;
  `;
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  await new Promise(r => setTimeout(r, 500));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: RENDER_WIDTH,
      windowWidth: RENDER_WIDTH,
      scrollX: 0,
      scrollY: 0,
    });

    // PDF page width = A4 width (210mm), height = proportional to content
    const pdfWidth = 210; // mm (A4 width)
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Create PDF with custom page size matching the content
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    pdf.save(`${filename}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
