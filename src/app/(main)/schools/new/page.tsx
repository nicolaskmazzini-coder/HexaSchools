import { auth } from "@/auth";
import { createSchoolAction } from "@/app/actions/school";
import { SchoolForm } from "@/components/schools/school-form";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewSchoolPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/schools/new");

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link href="/schools" className="text-sm text-teal-300 hover:underline">
        ← Instituições
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">Nova instituição</h1>
      <p className="mt-1 text-sm text-slate-300">
        Você será o diretor e poderá convidar administradores, professores e alunos.
      </p>

      <div className="mt-8">
        <SchoolForm action={createSchoolAction} submitLabel="Criar instituição">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Nome da instituição</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              placeholder="Ex.: Faculdade Demo"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">E-mail institucional</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              placeholder="contato@escola.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Telefone (opcional)</label>
            <input
              name="phone"
              className="w-full rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white"
              placeholder="(11) 99999-0000"
            />
          </div>
        </SchoolForm>
      </div>
    </div>
  );
}
