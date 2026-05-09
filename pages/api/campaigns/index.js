import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { ethAddress, title, description, imageUrl, creatorAddress } = req.body;
      
      // 1. Always normalize Ethereum addresses to lowercase for the database
      const normalizedCreator = creatorAddress.toLowerCase();

      // 2. Safety Net: Ensure the User actually exists in the DB before making the campaign
      // 'upsert' means "Update if they exist, Insert if they don't"
      await prisma.user.upsert({
        where: { ethAddress: normalizedCreator },
        update: {}, // Do nothing if they already exist
        create: { ethAddress: normalizedCreator }, // Create a blank profile if they don't
      });

      // 3. Save the new campaign, linking it to the normalized User address
      const newCampaign = await prisma.campaign.create({
        data: { 
          ethAddress, 
          title, 
          description, 
          imageUrl: imageUrl || null, 
          creatorAddress: normalizedCreator 
        },
      });
      
      res.status(200).json(newCampaign);
    } catch (error) {
      console.error("❌ PRISMA POST ERROR:", error);
      res.status(500).json({ error: "Failed to save campaign metadata" });
    }
  } else if (req.method === 'GET') {
    // Fetch all campaigns for the homepage
    try {
      const campaigns = await prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(campaigns);
    } catch (error) {
      console.error("❌ PRISMA GET ERROR:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}