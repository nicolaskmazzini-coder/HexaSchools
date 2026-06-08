import { auth } from "@/auth";
import { assignTeacherAction, enrollStudentAction } from "@/app/actions/school";
import { SchoolForm } from "@/components/schools/school-form";
import { getHexavanteCourseLearnUrl } from "@/lib/hexavante";
import { canAssignTeachers, canManageAcademics } from "@/lib/school-permissions";
import {
  getSchoolClass,
  getSchoolMembership,
  getSchoolStudents,
  getSchoolTeachers,
} from "@/services/school.service";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string; classId: string }> };

export default async function SchoolClassDetailPage({ params }: Props) {
  const { id, classId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/schools/${id}/classes/${classId}`);

  const membership = await getSchoolMembership(session.user.id, id);
  if (!membership) notFound();

  const schoolClass = await getSchoolClass(id, classId);
  if (!schoolClass) notFound();

  const role = membership.institutionRole;
  const canManage =
    canManageAcademics(role) ||
    (role === "TEACHER" && schoolClass.teachers.some((t) => t.userId === session.user.id));

  if (!canManage && role !== "STUDENT") redirect(`/schools/${id}`);

  const enrolledIds = new Set(schoolClass.enrollments.map((e) => e.userId));
  const assignedTeacherIds = new Set(schoolClass.teachers.map((t) => t.userId));

  const [students, teachers] = canManageAcademics(role)
    ? await Promise.all([getSchoolStudents(id), getSchoolTeachers(id)])
    : [[], []];

  const availableStudents = students.filter((s) => !enrolledIds.has(s.userId));
  const availableTeachers = teachers.filter((t) => !assignedTeacherIds.has(t.userId));
  const platformSlug = schoolClass.schoolCourse.platformCourseSlug;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href={`/schools/${id}/courses/${schoolClass.schoolCourseId}`}
        className="text-sm text-teal-300 hover:underline"
      >
        ← {schoolClass.schoolCourse.title}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{schoolClass.name}</h1>
      {schoolClass.semester && <p className="text-sm text-slate-400">Semestre: {schoolClass.semester}</p>}

      {canManageAcademics(role) && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SchoolForm action={enrollStudentAction.bind(null, id, classId)} submitLabel="Matricular aluno">
            <label className="mb-1 block text-sm font-medium text-slate-300">Aluno</label>
            <select
              name="userId"
              required
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
            >
              <option value="">Selecione...</option>
              {availableStudents.map((s) => (
                <option key={s.userId} value={s.userId}>
                  {s.user.fullName} (@{s.user.username})
                </option>
              ))}
            </select>
          </SchoolForm>

          {canAssignTeachers(role) && (
            <SchoolForm action={assignTeacherAction.bind(null, id, classId)} submitLabel="Atribuir professor">
              <label className="mb-1 block text-sm font-medium text-slate-300">Professor</label>
              <select
                name="userId"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              >
                <option value="">Selecione...</option>
                {availableTeachers.map((t) => (
                  <option key={t.userId} value={t.userId}>
                    {t.user.fullName} (@{t.user.username})
                  </option>
                ))}
              </select>
            </SchoolForm>
          )}
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-semibold text-white">Alunos ({schoolClass.enrollments.length})</h2>
          {schoolClass.enrollments.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">Nenhum aluno matriculado.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
              {schoolClass.enrollments.map((enrollment) => (
                <li key={enrollment.id} className="px-4 py-3">
                  <p className="font-medium text-white">{enrollment.user.fullName}</p>
                  <p className="text-sm text-slate-400">@{enrollment.user.username}</p>
                  {platformSlug && enrollment.userId === session.user.id && (
                    <a
                      href={getHexavanteCourseLearnUrl(platformSlug)}
                      className="mt-1 inline-block text-sm text-teal-300 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Estudar no Hexavante →
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-semibold text-white">Professores ({schoolClass.teachers.length})</h2>
          {schoolClass.teachers.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">Nenhum professor atribuído.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
              {schoolClass.teachers.map((teacher) => (
                <li key={teacher.id} className="px-4 py-3">
                  <p className="font-medium text-white">{teacher.user.fullName}</p>
                  <p className="text-sm text-slate-400">@{teacher.user.username}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
