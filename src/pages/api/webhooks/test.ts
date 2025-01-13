import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Webhook test endpoint hit!');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  return res.status(200).json({ message: 'Test endpoint working!' });
}
