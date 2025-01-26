import bcrypt from "bcryptjs";

export const passwordHashing = async (password) => {
  try {
    const hashing = await bcrypt.hash(password, 10);
    if (hashing) {
      return hashing;
    }
  } catch (error) {
    throw new Error("error while hash password");
  }
};
