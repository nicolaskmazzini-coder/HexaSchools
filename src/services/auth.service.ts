import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { LoginInput, RegisterInput } from "@/lib/validations/auth";

const MIN_AGE = 13;

function assertMinimumAge(birthDate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < MIN_AGE) {
    throw new Error("É necessário ter no mínimo 13 anos para se cadastrar.");
  }
}

export async function registerUser(data: RegisterInput) {
  assertMinimumAge(data.birthDate);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });

  if (existing) {
    if (existing.email === data.email) throw new Error("Este e-mail já está em uso.");
    throw new Error("Este nome de usuário já está em uso.");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
  if (!userRole) throw new Error("Papel USER não encontrado. Execute o seed do banco.");

  return prisma.user.create({
    data: {
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      birthDate: data.birthDate,
      roles: { create: { roleId: userRole.id } },
    },
    select: { id: true, username: true, email: true, fullName: true },
  });
}

export async function validateCredentials(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { roles: { include: { role: true } } },
  });

  if (!user?.passwordHash) return null;

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    username: user.username,
    roles: user.roles.map((r) => r.role.name),
  };
}
