import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

if (process.env.JWT_SECRET) {
  console.log("JWT_SECRET loaded from env (starts with):", process.env.JWT_SECRET.substring(0, 5));
} else {
  console.log("JWT_SECRET using fallback default");
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: "candidate" | "employer" | "admin";
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    if (error instanceof Error) {
      console.log("JWT Verification Error:", error.message);
    } else {
      console.log("JWT Verification Error: Unknown error", error);
    }
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
