import { PrismaClient } from '@prisma/client';

// Best practice for Next.js: reuse the prisma client instance
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  const { address } = req.query; 
  
  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  const normalizedAddress = address.toLowerCase();

  // --- HANDLE GET ---
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { ethAddress: normalizedAddress },
      });
      
      if (!user) {
        // Return 200 with empty string so the frontend doesn't crash
        return res.status(200).json({ username: "" }); 
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error("GET_USER_ERROR:", error);
      return res.status(500).json({ error: "Failed to fetch user from database" });
    }
  }

  // --- HANDLE PUT ---
  if (req.method === 'PUT') {
    try {
      const { username } = req.body;

      const user = await prisma.user.upsert({
        where: { ethAddress: normalizedAddress },
        update: { username: username },
        create: { 
          ethAddress: normalizedAddress, 
          username: username 
        },
      });

      return res.status(200).json(user);
    } catch (error) {
      console.error("UPSERT_USER_ERROR:", error);
      return res.status(500).json({ error: "Could not save to database." });
    }
  } 
  
  // --- HANDLE OTHERS ---
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}