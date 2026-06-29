import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { sendOTPEmail, sendResetOTPEmail } from "../services/mail.js";

const router = Router();

// Helper to generate a random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. Send OTP / Pre-register details
router.post("/register-otp", async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    // Check if user already exists and is verified
    let user = await User.findOne({ email });
    if (user && user.isVerified) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    if (user) {
      // Update pending user
      user.username = username;
      user.passwordHash = passwordHash;
      user.otpCode = otpCode;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Create new pending user
      user = new User({
        username,
        email,
        passwordHash,
        otpCode,
        otpExpires,
        isVerified: false
      });
      await user.save();
    }

    // Send actual verification code email via configured SMTP
    const emailSent = await sendOTPEmail(email, otpCode);

    if (!emailSent) {
      res.status(500).json({ message: "Failed to dispatch email verification OTP. Please verify your SMTP settings." });
      return;
    }

    // Return response with convenience devOtp (for fallback/test ease)
    res.status(200).json({
      message: "OTP sent successfully to email",
      devOtp: otpCode
    });
  } catch (error) {
    console.error("Register OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Verify OTP and finalize registration
router.post("/verify-otp", async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ message: "Email and OTP are required" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ message: "User is already verified" });
      return;
    }

    if (!user.otpCode || user.otpCode !== otp) {
      res.status(400).json({ message: "Invalid OTP code" });
      return;
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    // Set verified status
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Create JWT
    const secret = process.env.JWT_SECRET || "super_secret_key_for_diabeguide_jwt";
    const token = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "OTP verified, registration complete",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        age: user.age,
        weight: user.weight,
        diabetesType: user.diabetesType,
        emergencyContact: user.emergencyContact,
        healthScore: user.healthScore,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 3. Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.isVerified) {
      res.status(400).json({ message: "Account is not verified. Please register again to get an OTP." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Create JWT
    const secret = process.env.JWT_SECRET || "super_secret_key_for_diabeguide_jwt";
    const token = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        age: user.age,
        weight: user.weight,
        diabetesType: user.diabetesType,
        emergencyContact: user.emergencyContact,
        healthScore: user.healthScore,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 4. Get Current User Details
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 5. Update Profile Details
router.put("/profile", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, age, weight, diabetesType, emergencyContact, avatar } = req.body;

  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (age !== undefined) user.age = Number(age);
    if (weight !== undefined) user.weight = Number(weight);
    if (diabetesType !== undefined) user.diabetesType = diabetesType;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone: user.phone,
        age: user.age,
        weight: user.weight,
        diabetesType: user.diabetesType,
        emergencyContact: user.emergencyContact,
        healthScore: user.healthScore,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 6. Request Forgot Password OTP
router.post("/forgot-password", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found with this email" });
      return;
    }

    if (!user.isVerified) {
      res.status(400).json({ message: "User email is not verified. Please register first." });
      return;
    }

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    // Send reset verification code
    const emailSent = await sendResetOTPEmail(email, otpCode);
    if (!emailSent) {
      res.status(500).json({ message: "Failed to dispatch reset code email. Please verify SMTP setup." });
      return;
    }

    res.status(200).json({
      message: "Reset code sent to email successfully",
      devOtp: otpCode
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 7. Verify Reset OTP and update password
router.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    res.status(400).json({ message: "All parameters are required" });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    if (!user.otpCode || user.otpCode !== otp) {
      res.status(400).json({ message: "Invalid OTP code" });
      return;
    }

    if (user.otpExpires && user.otpExpires < new Date()) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
