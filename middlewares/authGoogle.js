const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Expect: Bearer <id_token>
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    req.user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub, // unique Google user ID
    };

    next(); // continue to controller
  } catch (error) {
    console.error("Invalid Google token:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = verifyGoogleToken;
