import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { utils, write } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { format, filters, reportName } = req.body;

    // Fetch data based on filters
    const data = await fetchDataForExport(filters);

    // Generate export file
    const exportData = await generateExport(format, data, reportName);

    // Set appropriate headers
    res.setHeader('Content-Type', getContentType(format));
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${reportName}_${new Date().toISOString().split('T')[0]}.${format}"`
    );

    res.send(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to generate export' });
  }
}

async function fetchDataForExport(filters: any) {
  // Fetch responses with all related data
  const responses = await prisma.response.findMany({
    where: {
      ...(filters.startDate && {
        createdAt: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        },
      }),
      ...(filters.groups && { groupId: { in: filters.groups } }),
      ...(filters.locations && { locationId: { in: filters.locations } }),
      ...(filters.surveys && { surveyId: { in: filters.surveys } }),
    },
    include: {
      employee: true,
      group: true,
      location: true,
      survey: true,
      drivers: true,
    },
  });

  return responses;
}

async function generateExport(format: string, data: any[], reportName: string) {
  switch (format) {
    case 'csv':
      return generateCSV(data);
    case 'pdf':
      return generatePDF(data, reportName);
    default:
      throw new Error('Unsupported format');
  }
}

function generateCSV(data: any[]) {
  // Format data for CSV
  const formattedData = data.map(response => ({
    Date: response.createdAt,
    'Employee Name': response.employee.name,
    'Employee Email': response.employee.email,
    Group: response.group.name,
    Location: response.location.name,
    Survey: response.survey.name,
    Rating: response.rating,
    Feedback: response.feedback,
    'Response Drivers': response.drivers.map((d: any) => d.name).join(', '),
    'Response Time (hours)': response.responseTime,
  }));

  // Create workbook and worksheet
  const ws = utils.json_to_sheet(formattedData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Responses');

  // Generate buffer
  return write(wb, { type: 'buffer', bookType: 'csv' });
}

function generatePDF(data: any[], reportName: string) {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(16);
  doc.text(reportName, 14, 15);

  // Add metadata
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);
  doc.text(`Total Responses: ${data.length}`, 14, 30);

  // Add summary statistics
  const avgRating = calculateAverageRating(data);
  doc.text(`Average Rating: ${avgRating.toFixed(2)}`, 14, 35);

  // Format data for table
  const tableData = data.map(response => [
    response.createdAt.toLocaleDateString(),
    response.employee.name,
    response.group.name,
    response.location.name,
    response.rating,
    response.feedback.substring(0, 50) + (response.feedback.length > 50 ? '...' : ''),
  ]);

  // Add table
  (doc as any).autoTable({
    head: [['Date', 'Employee', 'Group', 'Location', 'Rating', 'Feedback']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  return doc.output('arraybuffer');
}

function calculateAverageRating(responses: any[]) {
  if (responses.length === 0) return 0;
  return responses.reduce((sum, r) => sum + r.rating, 0) / responses.length;
}

function getContentType(format: string) {
  switch (format) {
    case 'csv':
      return 'text/csv';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}
