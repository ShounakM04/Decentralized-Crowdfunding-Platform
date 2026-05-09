import { serialize } from 'cookie';

export default async function handler(req, res) {
  res.setHeader('Set-Cookie', serialize('auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  }));
  res.status(200).json({ success: true });
}