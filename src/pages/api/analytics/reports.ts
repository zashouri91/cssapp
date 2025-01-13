import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      return handleScheduleReport(req, res);
    case 'GET':
      return handleGetScheduledReports(req, res);
    case 'DELETE':
      return handleDeleteScheduledReport(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleScheduleReport(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { frequency, recipients, format, filters, name } = req.body;

    // Validate input
    if (!frequency || !recipients || !format) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create scheduled report
    const report = await prisma.scheduledReport.create({
      data: {
        name,
        frequency,
        recipients: recipients,
        format,
        filters: filters,
        userId: req.body.userId,
        nextRunAt: calculateNextRunTime(frequency),
      },
    });

    // Schedule the report using your preferred job scheduler
    // For example, using Bull queue:
    // await scheduleReportJob(report);

    res.status(201).json(report);
  } catch (error) {
    console.error('Schedule report error:', error);
    res.status(500).json({ error: 'Failed to schedule report' });
  }
}

async function handleGetScheduledReports(req: NextApiRequest, res: NextApiResponse) {
  try {
    const reports = await prisma.scheduledReport.findMany({
      where: { userId: req.body.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    console.error('Get scheduled reports error:', error);
    res.status(500).json({ error: 'Failed to get scheduled reports' });
  }
}

async function handleDeleteScheduledReport(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    await prisma.scheduledReport.delete({
      where: { id: String(id) },
    });

    // Cancel scheduled job
    // await cancelScheduledJob(id);

    res.status(204).end();
  } catch (error) {
    console.error('Delete scheduled report error:', error);
    res.status(500).json({ error: 'Failed to delete scheduled report' });
  }
}

function calculateNextRunTime(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      return new Date(now.setDate(now.getDate() + 1));
    case 'weekly':
      return new Date(now.setDate(now.getDate() + 7));
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    default:
      return now;
  }
}
