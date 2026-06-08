import { auth } from "@/auth";
import { createSchoolCourseAction } from "@/app/actions/school";
import { SchoolForm } from "@/components/schools/school-form";
import { SchoolNav } from "@/components/schools/school-nav";
import { canManageAcademics } from "@/lib/school-permissions";
import { getSchoolMembership, listSchoolCourses } from "@/services/school.service";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function SchoolCoursesPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/schools/${id}/courses`);

  const membership = await getSchoolMembership(session.user.id, id);
  if (!membership) notFound();
  if (!canManageAcademics(membership.institutionRole)) redirect(`/schools/${id}`);

  const courses = await listSchoolCourses(id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href={`/schools/${id}`} className="text-sm text-teal-300 hover:underline">
        ← {membership.school.name}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Cursos institucionais</h1>

      <div className="mt-6">
        <SchoolNav schoolId={id} role={membership.institutionRole} active="courses" />
      </div>

      <div className="mt-8">
        <SchoolForm action={createSchoolCourseAction.bind(null, id)} submitLabel="Criar curso">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Título</label>
            <input
              name="title"
              required
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Descrição</label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Slug do curso no Hexavante (opcional)
            </label>
            <input
              name="platformCourseSlug"
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              placeholder="ex.: introducao-a-logica-de-programacao"
            />
            <p className="mt-1 text-xs text-slate-400">
              Use o slug da URL pública do curso no Hexavante para linkar o conteúdo.
            </p>
          </div>
        </SchoolForm>
      </div>

      {courses.length === 0 ? (
        <p className="mt-8 text-sm text-slate-400">Nenhum curso institucional ainda.</p>
      ) : (
        <ul className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
          {courses.map((course) => (
            <li key={course.id}>
              <Link
                href={`/schools/${id}/courses/${course.id}`}
                className="block px-4 py-4 hover:bg-white/10"
              >
                <p className="font-medium text-white">{course.title}</p>
                {course.platformCourseSlug && (
                  <p className="text-sm text-teal-300">Vinculado: {course.platformCourseSlug}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">{course._count.classes} turma(s)</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
