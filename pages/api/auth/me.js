import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ isLoggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ isLoggedIn: true, user: decoded });
  } catch (err) {
    res.status(401).json({ isLoggedIn: false });
  }
}