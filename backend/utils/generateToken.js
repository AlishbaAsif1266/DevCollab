import jwt from 'jsonwebtoken';

// Generate short-lived Access Token (15m)
export const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'devcollab_access_secret_token_2026',
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m',
    }
  );
};

// Generate long-lived Refresh Token (7d)
export const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || 'devcollab_refresh_secret_token_2026',
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
    }
  );
};

export default generateAccessToken;
