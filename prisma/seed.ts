import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: { name: "USER", description: "Usuário padrão" },
  });

  const directorPassword = await bcrypt.hash("Diretor123!", 12);
  const teacherPassword = await bcrypt.hash("Professor123!", 12);
  const studentPassword = await bcrypt.hash("Aluno123!", 12);

  const director = await prisma.user.upsert({
    where: { email: "diretor@hexaschools.com" },
    update: {},
    create: {
      username: "diretor_demo",
      fullName: "Diretor Demo",
      email: "diretor@hexaschools.com",
      passwordHash: directorPassword,
      birthDate: new Date("1985-03-10"),
      roles: { create: [{ roleId: userRole.id }] },
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "professor@hexaschools.com" },
    update: {},
    create: {
      username: "professor_demo",
      fullName: "Professor Demo",
      email: "professor@hexaschools.com",
      passwordHash: teacherPassword,
      birthDate: new Date("1990-06-20"),
      roles: { create: [{ roleId: userRole.id }] },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "aluno@hexaschools.com" },
    update: {},
    create: {
      username: "aluno_demo",
      fullName: "Aluno Demo",
      email: "aluno@hexaschools.com",
      passwordHash: studentPassword,
      birthDate: new Date("2006-08-15"),
      roles: { create: [{ roleId: userRole.id }] },
    },
  });

  let school = await prisma.school.findFirst({ where: { email: "escola@hexaschools.com" } });
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: "Escola Demo HexaSchools",
        email: "escola@hexaschools.com",
        phone: "(11) 99999-0000",
      },
    });
  }

  await prisma.schoolUser.upsert({
    where: { schoolId_userId: { schoolId: school.id, userId: director.id } },
    update: {},
    create: { schoolId: school.id, userId: director.id, institutionRole: "DIRECTOR" },
  });

  await prisma.schoolUser.upsert({
    where: { schoolId_userId: { schoolId: school.id, userId: teacher.id } },
    update: { institutionRole: "TEACHER" },
    create: { schoolId: school.id, userId: teacher.id, institutionRole: "TEACHER" },
  });

  await prisma.schoolUser.upsert({
    where: { schoolId_userId: { schoolId: school.id, userId: student.id } },
    update: {},
    create: { schoolId: school.id, userId: student.id, institutionRole: "STUDENT" },
  });

  let schoolCourse = await prisma.schoolCourse.findFirst({
    where: { schoolId: school.id, title: "Lógica de Programação" },
  });

  if (!schoolCourse) {
    schoolCourse = await prisma.schoolCourse.create({
      data: {
        schoolId: school.id,
        title: "Lógica de Programação",
        description: "Curso institucional vinculado ao Hexavante.",
        platformCourseSlug: "introducao-a-logica-de-programacao",
      },
    });
  }

  let schoolClass = await prisma.schoolClass.findFirst({
    where: { schoolCourseId: schoolCourse.id, name: "Turma A - 2025.1" },
  });

  if (!schoolClass) {
    schoolClass = await prisma.schoolClass.create({
      data: {
        schoolCourseId: schoolCourse.id,
        name: "Turma A - 2025.1",
        semester: "2025.1",
      },
    });
  }

  await prisma.schoolClassTeacher.upsert({
    where: { classId_userId: { classId: schoolClass.id, userId: teacher.id } },
    update: {},
    create: { classId: schoolClass.id, userId: teacher.id },
  });

  const existingEnrollment = await prisma.schoolEnrollment.findUnique({
    where: { classId_userId: { classId: schoolClass.id, userId: student.id } },
  });

  if (!existingEnrollment) {
    await prisma.schoolEnrollment.create({
      data: { classId: schoolClass.id, userId: student.id },
    });
  }

  console.log("Seed HexaSchools concluído:");
  console.log("- Diretor: diretor@hexaschools.com / Diretor123!");
  console.log("- Professor: professor@hexaschools.com / Professor123!");
  console.log("- Aluno: aluno@hexaschools.com / Aluno123!");
  console.log("- Escola demo em /schools");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
