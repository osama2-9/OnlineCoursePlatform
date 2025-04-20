import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/prismaClint.js";
dotenv.config();

const oauth2Client = new OAuth2Client({
  clientId: process.env.OAUTH_GOOGLE_CLIENT,
  clientSecret: process.env.OAUTH_GOOGLE_SECRET,
  redirectUri: process.env.GOOGLE_CALLBACK_URL
});

const generateAuthUrl = (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid"
    ],
    prompt: "consent"
  });
  return res.json({ url: authUrl });
};

const getUserInfo = async (access_token) => {
  try {
    const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    if (!res.ok) {
      throw new Error(`Google API error: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

const handleGoogleCallback = async (req, res) => {
  try {
    const code = req.query.code;
    
    if (!code) {
      try {
        const token = req.cookies.auth;
        console.error(token);
        

        
        if (!token) {
          return res.status(401).json({ 
            success: false, 
            error: "Authentication required" 
          });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.users.findUnique({
          where: { user_id: decoded.userId }
        });
        
        if (!user) {
          return res.status(404).json({ 
            success: false, 
            error: "User not found" 
          });
        }
        
        return res.status(200).json({
          success: true,
          user: {
            userId: user.user_id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            towFAStatus: user.is_2fa_enabled,
            isActive: user.is_active,
          }
        });
      } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ 
          success: false, 
          error: "Authentication failed" 
        });
      }
    }
    
    if (!code) {
      return res.redirect(`${process.env.BASE_URL}/login?error=google_auth_failed`);
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    const googleUserInfo = await getUserInfo(tokens.access_token);
    console.log("Google User Info:", googleUserInfo);
    
    if (!googleUserInfo.email) {
      return res.redirect(`${process.env.BASE_URL}/login?error=google_auth_failed`);
    }
    
    let user = await prisma.users.findUnique({
      where: { email: googleUserInfo.email }
    });
    
    const currentTime = new Date();
    
    if (!user) {
      user = await prisma.users.create({
        data: {
          email: googleUserInfo.email,
          full_name: googleUserInfo.name || googleUserInfo.given_name || "Google User",
          googleId: googleUserInfo.sub,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token || null,
          googleProfile: googleUserInfo,
          authProvider: "google",
          isEmailVerified: true,
          lastLogin: currentTime,
          is_active: true
        }
      });
    } else {
      user = await prisma.users.update({
        where: { email: googleUserInfo.email },
        data: {
          googleId: googleUserInfo.sub,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token || user.googleRefreshToken,
          googleProfile: googleUserInfo,
          authProvider: "google",
          lastLogin: currentTime,
          is_active: true
        }
      });
    }
    
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    res.cookie("auth", token, {
      httpOnly: true,
      secure: true,
      maxAge: 48 * 60 * 60 * 1000,
      sameSite: 'None'
    });
    
    return res.redirect(`${process.env.BASE_URL}/auth/google`);
    
  } catch (error) {
    console.error("Google OAuth error:", error);
    return res.redirect(`${process.env.BASE_URL}/login?error=google_auth_failed`);
  }
};

export { generateAuthUrl, handleGoogleCallback, oauth2Client };