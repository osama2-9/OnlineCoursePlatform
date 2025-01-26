import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookies } from "../utils/generateToken.js";
import { prisma } from "../prisma/prismaClint.js";
import { sendVerificationEmail } from "../emails/sendVerifictionEmail.js";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../emails/sendResetPasswordEmail.js";
import { passwordHashing } from "../utils/hashPassword.js";
dotenv.config();

export const isAuthenticated = async (req, res) => {
  const token = req.cookies.auth;
  
  if (!token) {
    return res.status(401).json({
      success: false,
    });
  } else {
    return res.status(200).json({
      success: true,
    });
  }
};

export const signup = async (req, res) => {
  try {
    const { full_name, email, password_hash } = req.body;
    if (!full_name || !email || !password_hash) {
      return res.status(400).json({
        error: "Please fill all feilds",
      });
    }

    const existEmail = await prisma.users.findUnique({
      where: { email: email },
    });

    if (existEmail) {
      return res.status(400).json({
        error: "This email already used",
      });
    }
    const hashed_password = await passwordHashing(password_hash);
    const newUser = await prisma.users.create({
      data: {
        full_name: full_name,
        email: email,
        password_hash: hashed_password,
      },
    });

    if (newUser) {
      generateTokenAndSetCookies(newUser?.user_id, newUser?.role, res);

      return res.status(201).json({
        userId: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: "Please fill all fields",
      });
    }

    const user = await prisma.users.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({
        error: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password_hash);

    if (!isPasswordValid) {
      return res.status(404).json({
        error: "Invalid email or password",
      });
    }

    generateTokenAndSetCookies(user?.user_id, user?.role, res);
    await prisma.users.update({
      where: { email: email },
      data: { lastLogin: new Date() },
    });

    return res.status(200).json({
      userId: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("auth", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const activeEmailRequest = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({
        error: "No user found",
      });
    }

    const user = await prisma.users.findUnique({ where: { user_id: user_id } });
    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    const token = crypto.randomBytes(128).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const update = await prisma.users.update({
      where: { user_id: user_id },
      data: {
        activeEmailToken: token,
        activeEmailTokenExpiresAt: expiresAt,
      },
    });
    if (!update) {
      return res.status(400).json({
        error: "error while set vars",
      });
    }
    await sendVerificationEmail(
      user.email,
      `${process.env.BASE_URL}/verify-email/${token}`
    );
    return res.status(200).json({
      message: "Email send",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token || !email) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        activeEmailToken: token,
        email: email,
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "No user found",
      });
    }

    if (user.activeEmailTokenExpiresAt > Date.now()) {
      await prisma.users.update({
        where: {
          email: email,
        },
        data: {
          isEmailVerified: true,
          activeEmailToken: null,
          activeEmailTokenExpiresAt: null,
        },
      });

      return res.status(200).json({
        message: "Email successfully verified",
      });
    } else {
      return res.status(400).json({
        error: "Verification token has expired",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        error: "Please enter your email ",
      });
    }
    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).json({
        error: "User with this email is not found",
      });
    }
    const token = crypto.randomBytes(128).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const updateResetPasswordTokens = await prisma.users.update({
      where: {
        email: email,
      },
      data: {
        resetPasswordToken: token,
        resetPasswordTokenExpirsAt: tokenExpiresAt,
      },
    });

    const resetPasswordUrl = `${process.env.BASE_URL}/reset-password/${token}`;
    if (!updateResetPasswordTokens) {
      return res.status(400).json({
        error: "error while try to reset password",
      });
    } else {
      await sendResetPasswordEmail(user.email, resetPasswordUrl);
      return res.status(200).json({
        message: "Email sent check your inbox !",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const setNewPassword = async (req, res) => {
  try {
    const { token, password, confirme_password } = req.body;
    if (!token) {
      return res.status(404).json({
        error: "No token found",
      });
    }

    if (!password || !confirme_password) {
      return res.status(400).json({
        error: "Please enter a valid password",
      });
    }
    if (password !== confirme_password) {
      return res.status(400).json({
        error: "Password not match",
      });
    }
    const userByToken = await prisma.users.findUnique({
      where: {
        resetPasswordToken: token,
      },
    });
    if (Date.now() > userByToken.resetPasswordTokenExpirsAt) {
      return res.status(400).json({
        error: "Invalid token please request a new reset",
      });
    }
    const newHashedPassword = await passwordHashing(password);
    const updatePassword = await prisma.users.update({
      where: {
        resetPasswordToken: token,
      },
      data: {
        password_hash: newHashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpirsAt: null,
      },
    });
    if (!updatePassword) {
      return res.status(400).json({
        error: "error while reset password",
      });
    } else {
      return res.status(200).json({
        message: "password updated successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
