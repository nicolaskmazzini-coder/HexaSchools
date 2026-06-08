import { auth } from "@/auth";
import { INSTITUTION_ROLE_LABELS } from "@/lib/school-permissions";
import { listUserSchools } from "@/services/school.service";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SchoolsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/schools");

  const memberships = await listUserSchools(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Instituições</h1>
          <p className="mt-2 text-slate-300">Gerencie escolas, membros e turmas.</p>
        </div>
        <Link
          href="/schools/new"
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500"
        >
          Criar instituição
        </Link>
      </div>

      {memberships.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-white/15 p-8 text-center">
          <p className="text-slate-400">Você ainda não participa de nenhuma instituição.</p>
          <Link href="/schools/new" className="mt-4 inline-block text-sm text-teal-300 hover:underline">
            Criar a primeira instituição →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
          {memberships.map((membership) => (
            <li key={membership.id}>
              <Link
                href={`/schools/${membership.schoolId}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/10"
              >
                <div>
                  <p className="font-medium text-white">{membership.school.name}</p>
                  <p className="text-sm text-slate-400">{membership.school.email}</p>
                </div>
                <span className="rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-300">
                  {INSTITUTION_ROLE_LABELS[membership.institutionRole]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
