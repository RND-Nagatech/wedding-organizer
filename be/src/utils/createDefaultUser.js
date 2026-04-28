import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/tm_user.js";

export async function createDefaultUser() {
  const email = process.env.DEFAULT_USER_EMAIL;
  const password = process.env.DEFAULT_USER_PASSWORD;
  if (!email || !password) return;

  const existing = await User.findOne({ email });
  if (existing) return;

  const hash = await bcrypt.hash(password, 10);
  await User.create({
    nama: "Default Owner",
    email,
    password: hash,
    role: "owner",
    aktif: true,
  });
  console.log("Default user created:", email);
}
