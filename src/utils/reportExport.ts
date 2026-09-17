import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface ExportPdfOptions {
  filename?: string;
  margin?: number;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Generates and downloads a high-fidelity PDF from any DOM element ID.
 * Uses native browser SVG/canvas rendering via html-to-image, which fully supports
 * Tailwind CSS v4's oklch() color format, Bangla typography, and custom styles.
 */
export async function downloadElementAsPdf(
  elementId: string,
  options: ExportPdfOptions = {}
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found.`);
    return false;
  }

  const filename = options.filename || `report-${new Date().toISOString().slice(0, 10)}.pdf`;
  const margin = options.margin !== undefined ? options.margin : 10;
  const orientation = options.orientation || 'portrait';

  // Standard A4 dimensions in mm
  const pageWidth = orientation === 'landscape' ? 297 : 210;
  const pageHeight = orientation === 'landscape' ? 210 : 297;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  try {
    // Generate high-resolution canvas with skipFonts: true and fontEmbedCSS: ''
    // This prevents SecurityError when reading document.styleSheets from cross-origin Google Fonts,
    // while the browser still renders text with all loaded fonts in the canvas.
    const canvas = await toCanvas(element, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
      fontEmbedCSS: '',
      filter: (node) => !(node instanceof HTMLElement && node.classList.contains('no-print'))
    });

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    // Calculate pagination based on printable content area height
    const pageCanvasHeight = Math.floor((contentHeight * canvas.width) / contentWidth);
    const totalPages = Math.ceil(canvas.height / pageCanvasHeight);

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage('a4', orientation);
      }

      const sourceY = page * pageCanvasHeight;
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

      // Create a slice canvas for this specific page
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          sliceCanvas.width,
          sliceHeight
        );
      }

      const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
      const renderedSliceHeight = (sliceHeight * contentWidth) / canvas.width;
      pdf.addImage(sliceData, 'JPEG', margin, margin, contentWidth, renderedSliceHeight);
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    return false;
  }
}

/**
 * Triggers browser print with fallback for sandboxed iframes.
 */
export function printElementDirectly(elementId: string, title?: string): boolean {
  try {
    // Try standard print first
    window.print();
    return true;
  } catch (e) {
    console.warn('Direct window.print() failed, attempting iframe print strategy...', e);
    return printElementViaHiddenFrame(elementId, title);
  }
}

/**
 * Creates an isolated hidden iframe with styles to trigger printing safely.
 */
export function printElementViaHiddenFrame(elementId: string, docTitle?: string): boolean {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return false;

    // Collect all head stylesheets
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(el => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle || document.title}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
          ${styles}
          <style>
            body {
              font-family: 'Hind Siliguri', system-ui, sans-serif !important;
              background-color: white !important;
              color: #0f172a !important;
              margin: 20px !important;
              padding: 0 !important;
            }
            .no-print { display: none !important; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
          </style>
        </head>
        <body>
          <div style="width: 100%; max-width: 1000px; margin: 0 auto;">
            ${element.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();

    // Clean up iframe after printing
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch (err) {
        // Ignored
      }
    }, 60000);

    return true;
  } catch (err) {
    console.error('Hidden frame print error:', err);
    return false;
  }
}

/**
 * Exports CSV data and triggers a browser download.
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  // Include UTF-8 BOM so Excel opens Bengali and international characters properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
