import type { InstitutionRole } from "@prisma/client";

const MANAGEMENT_ROLES: InstitutionRole[] = ["DIRECTOR", "ADMIN"];
const ACADEMIC_ROLES: InstitutionRole[] = ["DIRECTOR", "ADMIN", "COORDINATOR"];

export function canManageSchool(role: InstitutionRole): boolean {
  return MANAGEMENT_ROLES.includes(role);
}

export function canManageAcademics(role: InstitutionRole): boolean {
  return ACADEMIC_ROLES.includes(role);
}

export function canAssignTeachers(role: InstitutionRole): boolean {
  return ACADEMIC_ROLES.includes(role);
}

export const INSTITUTION_ROLE_LABELS: Record<InstitutionRole, string> = {
  DIRECTOR: "Diretor",
  ADMIN: "Administrador",
  COORDINATOR: "Coordenador",
  TEACHER: "Professor",
  STUDENT: "Aluno",
};

export const ASSIGNABLE_ROLES: InstitutionRole[] = [
  "ADMIN",
  "COORDINATOR",
  "TEACHER",
  "STUDENT",
];
