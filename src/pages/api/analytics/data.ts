import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      startDate,
      endDate,
      groups,
      locations,
      surveys,
      employees,
    } = req.query;

    // Base filters
    const dateFilter = {
      createdAt: {
        gte: startDate ? new Date(startDate as string) : undefined,
        lte: endDate ? new Date(endDate as string) : undefined,
      },
    };

    // Additional filters
    const additionalFilters = {
      ...(groups ? { groupId: { in: (groups as string).split(',') } } : {}),
      ...(locations ? { locationId: { in: (locations as string).split(',') } } : {}),
      ...(surveys ? { surveyId: { in: (surveys as string).split(',') } } : {}),
      ...(employees ? { employeeId: { in: (employees as string).split(',') } } : {}),
    };

    // Fetch all required data in parallel
    const [
      responses,
      ratingDistribution,
      responseDrivers,
      locationStats,
      wordFrequency,
      comparativeStats,
    ] = await Promise.all([
      // Recent responses
      prisma.response.findMany({
        where: { ...dateFilter, ...additionalFilters },
        include: {
          employee: true,
          group: true,
          location: true,
          survey: true,
          drivers: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),

      // Rating distribution
      prisma.response.groupBy({
        by: ['rating'],
        where: { ...dateFilter, ...additionalFilters },
        _count: true,
      }),

      // Response drivers
      prisma.responseDriver.groupBy({
        by: ['driverId'],
        where: {
          response: { ...dateFilter, ...additionalFilters },
        },
        _count: true,
      }),

      // Location stats
      prisma.location.findMany({
        include: {
          _count: {
            select: { responses: { where: { ...dateFilter, ...additionalFilters } } },
          },
          responses: {
            where: { ...dateFilter, ...additionalFilters },
            select: { rating: true },
          },
        },
      }),

      // Word frequency from feedback text
      prisma.response.findMany({
        where: { ...dateFilter, ...additionalFilters },
        select: { feedback: true },
      }),

      // Comparative stats
      Promise.all([
        // Group stats
        prisma.group.findMany({
          include: {
            _count: {
              select: { responses: { where: { ...dateFilter, ...additionalFilters } } },
            },
            responses: {
              where: { ...dateFilter, ...additionalFilters },
              select: { rating: true, responseTime: true },
            },
          },
        }),
        // Location stats
        prisma.location.findMany({
          include: {
            _count: {
              select: { responses: { where: { ...dateFilter, ...additionalFilters } } },
            },
            responses: {
              where: { ...dateFilter, ...additionalFilters },
              select: { rating: true, responseTime: true },
            },
          },
        }),
      ]),
    ]);

    // Process word frequency for sentiment analysis
    const words = processWordFrequency(wordFrequency);

    // Format response data
    const analyticsData = {
      responses: formatResponses(responses),
      ratingDistribution: formatRatingDistribution(ratingDistribution),
      drivers: formatDrivers(responseDrivers),
      locations: formatLocationStats(locationStats),
      words,
      comparative: formatComparativeStats(comparativeStats),
      metadata: {
        totalResponses: responses.length,
        averageRating: calculateAverageRating(responses),
        responseRate: calculateResponseRate(responses),
      },
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics data error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
}

// Helper functions for data processing
function processWordFrequency(responses: any[]) {
  // Implement word frequency analysis with sentiment
  // You might want to use a sentiment analysis library here
  return [];
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

function formatRatingDistribution(distribution: any[]) {
  return distribution.map(d => ({
    rating: d.rating,
    count: d._count,
  }));
}

function formatDrivers(drivers: any[]) {
  return drivers.map(d => ({
    driver: d.driverId,
    count: d._count,
  }));
}

function formatLocationStats(locations: any[]) {
  return locations.map(location => ({
    name: location.name,
    coordinates: [location.longitude, location.latitude],
    value: location._count.responses,
  }));
}

function formatComparativeStats([groups, locations]: [any[], any[]]) {
  return {
    groups: groups.map(formatEntityStats),
    locations: locations.map(formatEntityStats),
  };
}

function formatEntityStats(entity: any) {
  const responses = entity.responses;
  return {
    name: entity.name,
    metrics: {
      averageRating: calculateAverageRating(responses),
      responseRate: calculateResponseRate(responses),
      responseTime: calculateAverageResponseTime(responses),
      positiveResponsePercentage: calculatePositiveResponsePercentage(responses),
    },
  };
}

function calculateAverageRating(responses: any[]) {
  if (responses.length === 0) return 0;
  return responses.reduce((sum, r) => sum + r.rating, 0) / responses.length;
}

function calculateResponseRate(responses: any[]) {
  // Implement response rate calculation
  return 0;
}

function calculateAverageResponseTime(responses: any[]) {
  if (responses.length === 0) return 0;
  return responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
}

function calculatePositiveResponsePercentage(responses: any[]) {
  if (responses.length === 0) return 0;
  const positiveResponses = responses.filter(r => r.rating >= 4).length;
  return (positiveResponses / responses.length) * 100;
}
