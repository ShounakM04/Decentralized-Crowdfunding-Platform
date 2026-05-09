import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { ethAddress } = req.body;
  if (!ethAddress) return res.status(400).json({ error: "Address required" });

  const normalizedAddress = ethAddress.toLowerCase();

  try {
    let user = await prisma.user.findUnique({ where: { ethAddress: normalizedAddress } });
    
    if (!user) {
      user = await prisma.user.create({ data: { ethAddress: normalizedAddress } });
    }

    res.status(200).json({ nonce: user.nonce });
  } catch (error) {
    console.error("Nonce Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}