import { ActivityLevel, Gender, Goal } from '@prisma/client';
import prisma from '../lib/prisma';

const USER_SELECT = {
  id: true, email: true, name: true, age: true,
  weight_kg: true, height_cm: true, gender: true,
  activity_level: true, goal: true,
  created_at: true, updated_at: true,
} as const;

export async function findById(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: USER_SELECT,
  });
}

interface UpdateInput {
  name?: string;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  gender?: Gender;
  activity_level?: ActivityLevel;
  goal?: Goal;
}

export async function updateUser(userId: string, data: UpdateInput) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: USER_SELECT,
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } });
}
