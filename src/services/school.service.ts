import type { InstitutionRole } from "@prisma/client";
import {
  canAssignTeachers,
  canManageAcademics,
  canManageSchool,
} from "@/lib/school-permissions";
import type {
  AddMemberInput,
  CreateSchoolClassInput,
  CreateSchoolCourseInput,
  CreateSchoolInput,
} from "@/lib/validations/school";
import { prisma } from "@/lib/prisma";

export async function listUserSchools(userId: string) {
  return prisma.schoolUser.findMany({
    where: { userId },
    include: { school: true },
    orderBy: { joinedAt: "desc" },
  });
}

export async function getSchoolMembership(userId: string, schoolId: string) {
  return prisma.schoolUser.findUnique({
    where: { schoolId_userId: { schoolId, userId } },
    include: { school: true },
  });
}

export async function requireMembership(userId: string, schoolId: string) {
  const membership = await getSchoolMembership(userId, schoolId);
  if (!membership) {
    throw new Error("Você não pertence a esta instituição.");
  }
  return membership;
}

export async function createSchool(userId: string, data: CreateSchoolInput) {
  return prisma.school.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      members: {
        create: { userId, institutionRole: "DIRECTOR" },
      },
    },
  });
}

export async function getSchoolDashboard(schoolId: string) {
  const [memberCount, courseCount, classCount] = await Promise.all([
    prisma.schoolUser.count({ where: { schoolId } }),
    prisma.schoolCourse.count({ where: { schoolId } }),
    prisma.schoolClass.count({ where: { schoolCourse: { schoolId } } }),
  ]);

  return { memberCount, courseCount, classCount };
}

export async function listSchoolMembers(schoolId: string) {
  return prisma.schoolUser.findMany({
    where: { schoolId },
    include: {
      user: { select: { id: true, username: true, fullName: true, email: true } },
    },
    orderBy: { joinedAt: "asc" },
  });
}

export async function addSchoolMember(
  actorRole: InstitutionRole,
  schoolId: string,
  data: AddMemberInput,
) {
  if (!canManageSchool(actorRole)) {
    throw new Error("Sem permissão para gerenciar membros.");
  }

  if (data.institutionRole === "DIRECTOR") {
    throw new Error("Não é possível adicionar outro diretor por aqui.");
  }

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new Error("Usuário não encontrado. O membro precisa ter conta no HexaSchools.");
  }

  const existing = await prisma.schoolUser.findUnique({
    where: { schoolId_userId: { schoolId, userId: user.id } },
  });
  if (existing) {
    throw new Error("Este usuário já faz parte da instituição.");
  }

  return prisma.schoolUser.create({
    data: {
      schoolId,
      userId: user.id,
      institutionRole: data.institutionRole,
    },
    include: {
      user: { select: { id: true, username: true, fullName: true, email: true } },
    },
  });
}

export async function removeSchoolMember(
  actorRole: InstitutionRole,
  actorUserId: string,
  schoolId: string,
  memberId: string,
) {
  if (!canManageSchool(actorRole)) {
    throw new Error("Sem permissão para remover membros.");
  }

  const member = await prisma.schoolUser.findFirst({
    where: { id: memberId, schoolId },
  });
  if (!member) throw new Error("Membro não encontrado.");
  if (member.institutionRole === "DIRECTOR") {
    throw new Error("Não é possível remover o diretor.");
  }
  if (member.userId === actorUserId) {
    throw new Error("Você não pode remover a si mesmo.");
  }

  await prisma.schoolUser.delete({ where: { id: memberId } });
}

export async function listSchoolCourses(schoolId: string) {
  return prisma.schoolCourse.findMany({
    where: { schoolId },
    include: { _count: { select: { classes: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSchoolCourse(
  actorRole: InstitutionRole,
  schoolId: string,
  data: CreateSchoolCourseInput,
) {
  if (!canManageAcademics(actorRole)) {
    throw new Error("Sem permissão para criar cursos institucionais.");
  }

  return prisma.schoolCourse.create({
    data: {
      schoolId,
      title: data.title,
      description: data.description || null,
      platformCourseSlug: data.platformCourseSlug || null,
    },
  });
}

export async function getSchoolCourse(schoolId: string, schoolCourseId: string) {
  return prisma.schoolCourse.findFirst({
    where: { id: schoolCourseId, schoolId },
    include: {
      classes: {
        include: { _count: { select: { enrollments: true, teachers: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createSchoolClass(
  actorRole: InstitutionRole,
  schoolId: string,
  schoolCourseId: string,
  data: CreateSchoolClassInput,
) {
  if (!canManageAcademics(actorRole)) {
    throw new Error("Sem permissão para criar turmas.");
  }

  const schoolCourse = await prisma.schoolCourse.findFirst({
    where: { id: schoolCourseId, schoolId },
  });
  if (!schoolCourse) {
    throw new Error("Curso institucional não encontrado.");
  }

  return prisma.schoolClass.create({
    data: {
      schoolCourseId,
      name: data.name,
      semester: data.semester || null,
    },
  });
}

export async function getSchoolClass(schoolId: string, classId: string) {
  return prisma.schoolClass.findFirst({
    where: { id: classId, schoolCourse: { schoolId } },
    include: {
      schoolCourse: {
        include: { school: { select: { id: true, name: true } } },
      },
      enrollments: {
        include: {
          user: { select: { id: true, username: true, fullName: true, email: true } },
        },
        orderBy: { enrolledAt: "asc" },
      },
      teachers: {
        include: {
          user: { select: { id: true, username: true, fullName: true, email: true } },
        },
      },
    },
  });
}

export async function enrollStudentInClass(
  actorRole: InstitutionRole,
  schoolId: string,
  classId: string,
  studentUserId: string,
) {
  if (!canManageAcademics(actorRole)) {
    throw new Error("Sem permissão para matricular alunos.");
  }

  const schoolClass = await getSchoolClass(schoolId, classId);
  if (!schoolClass) throw new Error("Turma não encontrada.");

  const studentMember = await prisma.schoolUser.findUnique({
    where: { schoolId_userId: { schoolId, userId: studentUserId } },
  });
  if (!studentMember || studentMember.institutionRole !== "STUDENT") {
    throw new Error("O usuário precisa ser aluno desta instituição.");
  }

  const existing = await prisma.schoolEnrollment.findUnique({
    where: { classId_userId: { classId, userId: studentUserId } },
  });
  if (existing) throw new Error("Aluno já matriculado nesta turma.");

  await prisma.schoolEnrollment.create({
    data: { classId, userId: studentUserId },
  });
}

export async function assignTeacherToClass(
  actorRole: InstitutionRole,
  schoolId: string,
  classId: string,
  teacherUserId: string,
) {
  if (!canAssignTeachers(actorRole)) {
    throw new Error("Sem permissão para atribuir professores.");
  }

  const schoolClass = await getSchoolClass(schoolId, classId);
  if (!schoolClass) throw new Error("Turma não encontrada.");

  const teacherMember = await prisma.schoolUser.findUnique({
    where: { schoolId_userId: { schoolId, userId: teacherUserId } },
  });
  if (!teacherMember || teacherMember.institutionRole !== "TEACHER") {
    throw new Error("O usuário precisa ser professor desta instituição.");
  }

  const existing = await prisma.schoolClassTeacher.findUnique({
    where: { classId_userId: { classId, userId: teacherUserId } },
  });
  if (existing) throw new Error("Professor já atribuído a esta turma.");

  await prisma.schoolClassTeacher.create({
    data: { classId, userId: teacherUserId },
  });
}

export async function listStudentClasses(userId: string, schoolId: string) {
  return prisma.schoolEnrollment.findMany({
    where: {
      userId,
      schoolClass: { schoolCourse: { schoolId } },
    },
    include: {
      schoolClass: {
        include: {
          schoolCourse: true,
          teachers: {
            include: { user: { select: { fullName: true, username: true } } },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

export async function listTeacherClasses(userId: string, schoolId: string) {
  return prisma.schoolClassTeacher.findMany({
    where: {
      userId,
      schoolClass: { schoolCourse: { schoolId } },
    },
    include: {
      schoolClass: {
        include: {
          schoolCourse: true,
          _count: { select: { enrollments: true } },
        },
      },
    },
  });
}

export async function getSchoolStudents(schoolId: string) {
  return prisma.schoolUser.findMany({
    where: { schoolId, institutionRole: "STUDENT" },
    include: {
      user: { select: { id: true, username: true, fullName: true, email: true } },
    },
  });
}

export async function getSchoolTeachers(schoolId: string) {
  return prisma.schoolUser.findMany({
    where: { schoolId, institutionRole: "TEACHER" },
    include: {
      user: { select: { id: true, username: true, fullName: true, email: true } },
    },
  });
}
