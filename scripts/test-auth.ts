import { generateToken, verifyToken } from "../app/lib/auth";

const payload = {
  userId: "test-user-id",
  email: "test@example.com",
  role: "candidate" as const
};

const token = generateToken(payload);
console.log("Generated Token:", token);

const verified = verifyToken(token);
if (verified && verified.userId === payload.userId) {
  console.log("Verification Success!");
} else {
  console.error("Verification Failed!");
  console.log("Verified Result:", verified);
}
