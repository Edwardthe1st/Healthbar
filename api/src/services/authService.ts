import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { ActivityLevel, Gender, Goal } from '@prisma/client';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  age: number;
  weight_kg: number;
  height_cm: number;
  gender: Gender;
  activity_level: ActivityLevel;
  goal: Goal;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
}

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

function signTokens(userId: string): TokenPair {
  const access_token = jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { expiresIn: ACCESS_TOKEN_TTL },
  );
  const refresh_token = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: REFRESH_TOKEN_TTL },
  );
  return { access_token, refresh_token };
}

export async function register(input: RegisterInput): Promise<{ user: object; tokens: TokenPair }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const err = new Error('EMAIL_TAKEN');
    throw err;
  }

  const password_hash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password_hash,
      name: input.name,
      age: input.age,
      weight_kg: input.weight_kg,
      height_cm: input.height_cm,
      gender: input.gender,
      activity_level: input.activity_level,
      goal: input.goal,
    },
    select: {
      id: true, email: true, name: true, age: true,
      weight_kg: true, height_cm: true, gender: true,
      activity_level: true, goal: true, created_at: true,
    },
  });

  const tokens = signTokens(user.id);
  return { user, tokens };
}

export async function login(email: string, password: string): Promise<{ user: object; tokens: TokenPair }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const { password_hash: _h, ...safeUser } = user;
  const tokens = signTokens(user.id);
  return { user: safeUser, tokens };
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as { userId: string };

    // Verify user still exists
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new Error('INVALID_REFRESH_TOKEN');

    return signTokens(payload.userId);
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }
}
