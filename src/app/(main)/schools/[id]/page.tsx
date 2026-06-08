import { auth } from "@/auth";
import { SchoolNav } from "@/components/schools/school-nav";
import { getHexavanteCourseLearnUrl } from "@/lib/hexavante";
import { canManageAcademics, canManageSchool } from "@/lib/school-permissions";
import {
  getSchoolDashboard,
  getSchoolMembership,
  listStudentClasses,
  listTeacherClasses,
} from "@/services/school.service";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function SchoolDashboardPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/schools/${id}`);

  const membership = await getSchoolMembership(session.user.id, id);
  if (!membership) notFound();

  const role = membership.institutionRole;
  const stats = await getSchoolDashboard(id);

  const [studentClasses, teacherClasses] = await Promise.all([
    role === "STUDENT" ? listStudentClasses(session.user.id, id) : Promise.resolve([]),
    role === "TEACHER" ? listTeacherClasses(session.user.id, id) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/schools" className="text-sm text-teal-300 hover:underline">
        ← Instituições
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-white">{membership.school.name}</h1>
      <p className="mt-1 text-slate-300">{membership.school.email}</p>

      <div className="mt-6">
        <SchoolNav schoolId={id} role={role} active="dashboard" />
      </div>

      {(canManageSchool(role) || canManageAcademics(role)) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-2xl font-bold text-teal-300">{stats.memberCount}</p>
            <p className="text-sm text-slate-400">Membros</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-2xl font-bold text-teal-300">{stats.courseCount}</p>
            <p className="text-sm text-slate-400">Cursos institucionais</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-2xl font-bold text-teal-300">{stats.classCount}</p>
            <p className="text-sm text-slate-400">Turmas</p>
          </div>
        </div>
      )}

      {role === "STUDENT" && (
        <section className="mt-8">
          <h2 className="font-semibold text-white">Minhas turmas</h2>
          {studentClasses.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Você ainda não está matriculado em nenhuma turma.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {studentClasses.map((enrollment) => {
                const cls = enrollment.schoolClass;
                const slug = cls.schoolCourse.platformCourseSlug;
                return (
                  <li key={enrollment.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="font-medium text-white">{cls.name}</p>
                    <p className="text-sm text-slate-400">{cls.schoolCourse.title}</p>
                    {cls.semester && <p className="text-xs text-slate-500">Semestre: {cls.semester}</p>}
                    {slug && (
                      <a
                        href={getHexavanteCourseLearnUrl(slug)}
                        className="mt-2 inline-block text-sm text-teal-300 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Estudar no Hexavante →
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {role === "TEACHER" && (
        <section className="mt-8">
          <h2 className="font-semibold text-white">Turmas que leciono</h2>
          {teacherClasses.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Nenhuma turma atribuída a você ainda.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {teacherClasses.map((assignment) => {
                const cls = assignment.schoolClass;
                return (
                  <li key={assignment.id}>
                    <Link
                      href={`/schools/${id}/classes/${cls.id}`}
                      className="block rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:border-teal-400/35"
                    >
                      <p className="font-medium text-white">{cls.name}</p>
                      <p className="text-sm text-slate-400">{cls.schoolCourse.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{cls._count.enrollments} aluno(s)</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {canManageAcademics(role) && (
        <div className="mt-8">
          <Link
            href={`/schools/${id}/courses`}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
          >
            Gerenciar cursos
          </Link>
        </div>
      )}
    </div>
  );
}
