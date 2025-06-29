import { NextRequest, NextResponse } from 'next/server';
import htmlPdfNode from 'html-pdf-node';

export async function POST(req: NextRequest) {
  try {
    const { treeData } = await req.json();

    if (!treeData) {
      return NextResponse.json({ error: 'Tree data is required' }, { status: 400 });
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tree Health Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .tree-details p { margin: 5px 0; }
          .section { margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
          .healthy { color: green; font-weight: bold; }
          .unhealthy { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Tree Health Report for ${treeData.name}</h1>
        <div class="tree-details">
          <p><strong>Species:</strong> ${treeData.species}</p>
          <p><strong>Age:</strong> ${treeData.age} years</p>
          <p><strong>Health Score:</strong> <span class="${treeData.healthScore > 70 ? 'healthy' : 'unhealthy'}">${treeData.healthScore}%</span></p>
          <p><strong>Location:</strong> ${treeData.location}</p>
          <p><strong>Date Planted:</strong> ${treeData.datePlanted}</p>
          <p><strong>Last Assessment:</strong> ${treeData.lastAssessment}</p>
        </div>

        <div class="section">
          <h2>Notes:</h2>
          <p>${treeData.notes || 'No additional notes.'}</p>
        </div>
      </body>
      </html>
    `;

    const options = { format: 'A4' };
    const file = { content: htmlContent };

    const pdfBuffer = await htmlPdfNode.generatePdf(file, options);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="tree-health-report.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
