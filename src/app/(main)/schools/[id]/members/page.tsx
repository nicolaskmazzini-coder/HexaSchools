import { auth } from "@/auth";
import { addMemberAction, removeMemberAction } from "@/app/actions/school";
import { SchoolForm } from "@/components/schools/school-form";
import { SchoolNav } from "@/components/schools/school-nav";
import {
  ASSIGNABLE_ROLES,
  canManageSchool,
  INSTITUTION_ROLE_LABELS,
} from "@/lib/school-permissions";
import { getSchoolMembership, listSchoolMembers } from "@/services/school.service";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function SchoolMembersPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/schools/${id}/members`);

  const membership = await getSchoolMembership(session.user.id, id);
  if (!membership) notFound();
  if (!canManageSchool(membership.institutionRole)) redirect(`/schools/${id}`);

  const members = await listSchoolMembers(id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href={`/schools/${id}`} className="text-sm text-teal-300 hover:underline">
        ← {membership.school.name}
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Membros</h1>

      <div className="mt-6">
        <SchoolNav schoolId={id} role={membership.institutionRole} active="members" />
      </div>

      <div className="mt-8">
        <SchoolForm action={addMemberAction.bind(null, id)} submitLabel="Adicionar membro">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">E-mail do usuário</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
                placeholder="usuario@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Papel institucional</label>
              <select
                name="institutionRole"
                required
                className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {INSTITUTION_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400">O usuário precisa ter conta cadastrada no HexaSchools.</p>
        </SchoolForm>
      </div>

      <ul className="mt-8 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.04]">
        {members.map((member) => (
          <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium text-white">{member.user.fullName}</p>
              <p className="text-sm text-slate-400">
                @{member.user.username} · {member.user.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                {INSTITUTION_ROLE_LABELS[member.institutionRole]}
              </span>
              {member.institutionRole !== "DIRECTOR" && member.userId !== session.user.id && (
                <form action={removeMemberAction.bind(null, id, member.id)}>
                  <button type="submit" className="text-xs text-red-400 hover:underline">
                    Remover
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
