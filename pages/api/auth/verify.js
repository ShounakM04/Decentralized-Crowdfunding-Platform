import { PrismaClient } from '@prisma/client';
import Web3 from 'web3';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const prisma = new PrismaClient();
const web3 = new Web3();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { ethAddress, signature } = req.body;
  const normalizedAddress = ethAddress.toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { ethAddress: normalizedAddress } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // 1. Recreate the exact message the user signed
    const message = `Welcome to CrowdCoin! Please sign this message to log in.\n\nNonce: ${user.nonce}`;

    // 2. Cryptographically recover the address that signed this message
    const recoveredAddress = web3.eth.accounts.recover(message, signature);

    // 3. Verify the recovered address matches the user trying to log in
    if (recoveredAddress.toLowerCase() !== normalizedAddress) {
      return res.status(401).json({ error: "Signature verification failed" });
    }

    // 4. Success! Generate a new nonce for next time (prevents replay attacks)
    await prisma.user.update({
      where: { ethAddress: normalizedAddress },
      data: { nonce: crypto.randomUUID() } 
    });

    // 5. Create the JWT Token (Expires in 7 days)
    const token = jwt.sign(
      { ethAddress: normalizedAddress, role: "user" }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // 6. Set the JWT in a secure, HttpOnly cookie
    res.setHeader('Set-Cookie', serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    }));

    res.status(200).json({ success: true, user });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}