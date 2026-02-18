"use server";

import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// 1. Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

/**
 * STAGE 1: Check existence, Generate OTP, Save to DB, and Send Email
 */
export async function sendOtpAction(email: string) {
  try {
    // 1. Check if user exists BEFORE anything else
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // If they exist, return a friendly message immediately
    if (existingUser) {
      return { 
        success: false, 
        error: "This email is already registered. Please login instead." 
      };
    }

    // 2. If user doesn't exist, proceed with OTP generation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: otp, expires },
    });

    // 3. Attempt to send the email
    await transporter.sendMail({
      from: '"Lynks" <no-reply@lynk.com>',
      to: email,
      subject: "Your Lynks Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #050505; color: white; border-radius: 10px; border: 1px solid #1A241A;">
          <h2 style="color: #00B33C;">Verify your account</h2>
          <p>Use the code below to complete your registration:</p>
          <div style="background: #101610; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ffffff;">${otp}</span>
          </div>
          <p style="color: #808080; font-size: 12px;">This code will expire in 5 minutes.</p>
          <p style="color: #404040; font-size: 10px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    return { success: true };

  } catch (error) {
    // This block ONLY runs if something actually breaks (like Gmail being down)
    console.error("OTP Error:", error);
    return { 
      success: false, 
      error: "We couldn't send the code. Please check your connection and try again." 
    };
  }
}

/**
 * STAGE 2: Verify OTP and Create the User
 */
export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const otp = formData.get("otp") as string;
  const name = formData.get("name") as string; // Ensure name is captured if needed

  try {
    // 1. Check if the OTP matches and is not expired
    const verification = await prisma.verificationToken.findFirst({
      where: { identifier: email },
      orderBy: { expires: 'desc' } 
    });

    if (!verification || verification.token !== otp) {
      return { success: false, error: "Invalid verification code." };
    }

    if (new Date() > verification.expires) {
      return { success: false, error: "Verification code has expired." };
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        credits: 10, 
        name: "",
      },
    });

    // 4. Clean up the token
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Registration Error:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "User with this email already exists." };
    }
    return { success: false, error: "An unexpected database error occurred." };
  }
}