import Link from "next/link";
import { auth } from "@/auth";
import { ArrowRight, Building2, Users } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  const hexavanteUrl = process.env.NEXT_PUBLIC_HEXAVANTE_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200">
            Gestão institucional
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            Organize escolas, turmas e equipes em um painel dedicado.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            O HexaSchools cuida da parte institucional. O conteúdo dos cursos fica no{" "}
            <a href={hexavanteUrl} className="text-teal-300 hover:underline" target="_blank" rel="noreferrer">
              Hexavante
            </a>
            , vinculado por slug.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/schools"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
            >
              {session ? "Minhas instituições" : "Explorar instituições"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!session && (
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/[0.06]"
              >
                Criar conta
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <Building2 className="h-6 w-6 text-teal-300" />
            <p className="mt-3 font-semibold text-white">Instituições</p>
            <p className="mt-1 text-sm text-slate-400">Diretores e coordenadores gerenciam membros e turmas.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <Users className="h-6 w-6 text-sky-300" />
            <p className="mt-3 font-semibold text-white">Papéis</p>
            <p className="mt-1 text-sm text-slate-400">Diretor, professor, aluno e coordenação com permissões claras.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
