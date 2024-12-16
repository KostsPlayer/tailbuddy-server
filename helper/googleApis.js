import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, 
  process.env.GOOGLE_CLIENT_SECRET, 
  "https://shopify-blissserver.vercel.app/auth/google/callback",
  // "https://shopify-bliss.vercel.app/auth/google/callback",
  // "http://localhost:3000/auth/google/callback",
  // "http://localhost:5173/auth/google/callback",
  // "http://127.0.0.1:5500/auth/google/callback",
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email", 
  "https://www.googleapis.com/auth/userinfo.profile"
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

export { oauth2Client, authorizationUrl };