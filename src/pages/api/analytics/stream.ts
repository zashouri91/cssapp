import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Keep track of the last processed response ID
  let lastResponseId = 0;

  // Function to send updates
  const sendUpdate = async () => {
    try {
      // Get new responses since last update
      const newResponses = await prisma.response.findMany({
        where: {
          id: { gt: lastResponseId },
        },
        include: {
          employee: true,
          group: true,
          location: true,
          survey: true,
          drivers: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

      if (newResponses.length > 0) {
        // Update last processed ID
        lastResponseId = newResponses[newResponses.length - 1].id;

        // Calculate updated metrics
        const updates = await calculateUpdatedMetrics(newResponses);

        // Send the updates
        res.write(`data: ${JSON.stringify(updates)}\n\n`);
      } else {
        // Send heartbeat to keep connection alive
        res.write(':\n\n');
      }
    } catch (error) {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Error fetching updates' })}\n\n`);
    }
  };

  // Send updates every 5 seconds
  const interval = setInterval(sendUpdate, 5000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
}

async function calculateUpdatedMetrics(newResponses: any[]) {
  // Calculate various metrics based on new responses
  const updates = {
    newResponses: formatResponses(newResponses),
    metrics: {
      totalResponses: await getTotalResponses(),
      averageRating: await getAverageRating(),
      responseRate: await getResponseRate(),
    },
    distributions: {
      ratings: await getRatingDistribution(),
      drivers: await getDriverDistribution(),
      locations: await getLocationDistribution(),
    },
  };

  return updates;
}

function formatResponses(responses: any[]) {
  return responses.map(response => ({
    id: response.id,
    date: response.createdAt,
    employee: response.employee.name,
    group: response.group.name,
    location: response.location.name,
    survey: response.survey.name,
    rating: response.rating,
    feedback: response.feedback,
    drivers: response.drivers.map((d: any) => d.name),
  }));
}

async function getTotalResponses() {
  return prisma.response.count();
}

async function getAverageRating() {
  const result = await prisma.response.aggregate({
    _avg: {
      rating: true,
    },
  });
  return result._avg.rating || 0;
}

async function getResponseRate() {
  // Implement response rate calculation
  return 0;
}

async function getRatingDistribution() {
  return prisma.response.groupBy({
    by: ['rating'],
    _count: true,
  });
}

async function getDriverDistribution() {
  return prisma.responseDriver.groupBy({
    by: ['driverId'],
    _count: true,
  });
}

async function getLocationDistribution() {
  return prisma.location.findMany({
    include: {
      _count: {
        select: { responses: true },
      },
    },
  });
}
