import { z } from "zod";

const institutionRoleEnum = z.enum([
  "DIRECTOR",
  "ADMIN",
  "COORDINATOR",
  "TEACHER",
  "STUDENT",
]);

export const createSchoolSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email("E-mail inválido"),
  institutionRole: institutionRoleEnum,
});

export const createSchoolCourseSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  platformCourseSlug: z.string().optional(),
});

export const createSchoolClassSchema = z.object({
  name: z.string().min(2, "Nome da turma é obrigatório"),
  semester: z.string().optional(),
});

export const enrollStudentSchema = z.object({
  userId: z.string().min(1, "Selecione um aluno"),
});

export const assignTeacherSchema = z.object({
  userId: z.string().min(1, "Selecione um professor"),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type CreateSchoolCourseInput = z.infer<typeof createSchoolCourseSchema>;
export type CreateSchoolClassInput = z.infer<typeof createSchoolClassSchema>;
