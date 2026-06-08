import { auth } from "@/auth";
import { createSchoolClassAction } from "@/app/actions/school";
import { SchoolForm } from "@/components/schools/school-form";
import { getHexavanteCourseUrl } from "@/lib/hexavante";
import { canManageAcademics } from "@/lib/school-permissions";
import { getSchoolCourse, getSchoolMembership } from "@/services/school.service";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string; courseId: string }> };

export default async function SchoolCourseDetailPage({ params }: Props) {
  const { id, courseId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/schools/${id}/courses/${courseId}`);

  const membership = await getSchoolMembership(session.user.id, id);
  if (!membership) notFound();
  if (!canManageAcademics(membership.institutionRole)) redirect(`/schools/${id}`);

  const course = await getSchoolCourse(id, courseId);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href={`/schools/${id}/courses`} className="text-sm text-teal-300 hover:underline">
        ← Cursos
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">{course.title}</h1>
      {course.description && <p className="mt-2 text-slate-300">{course.description}</p>}
      {course.platformCourseSlug && (
        <p className="mt-2 text-sm text-teal-300">
          Curso no Hexavante:{" "}
          <a
            href={getHexavanteCourseUrl(course.platformCourseSlug)}
            className="hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {course.platformCourseSlug}
          </a>
        </p>
      )}

      <div className="mt-8">
        <SchoolForm action={createSchoolClassAction.bind(null, id, courseId)} submitLabel="Criar turma">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Nome da turma</label>
              <input
                name="name"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
                placeholder="Ex.: Turma A"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Semestre (opcional)</label>
              <input
                name="semester"
                className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
                placeholder="Ex.: 2025.1"
              />
            </div>
          </div>
        </SchoolForm>
      </div>

      <h2 className="mt-10 font-semibold text-white">Turmas</h2>
      {course.classes.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Nenhuma turma criada ainda.</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
          {course.classes.map((cls) => (
            <li key={cls.id}>
              <Link
                href={`/schools/${id}/classes/${cls.id}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-white/10"
              >
                <div>
                  <p className="font-medium text-white">{cls.name}</p>
                  {cls.semester && <p className="text-sm text-slate-400">{cls.semester}</p>}
                </div>
                <span className="text-xs text-slate-400">
                  {cls._count.enrollments} aluno(s) · {cls._count.teachers} prof.
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
