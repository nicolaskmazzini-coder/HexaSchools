import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Building2 } from "lucide-react";

export async function Header() {
  const session = await auth();
  const hexavanteUrl = process.env.NEXT_PUBLIC_HEXAVANTE_URL ?? "http://localhost:3000";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#06080f]/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="HexaSchools">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-teal-400/30 bg-teal-400/10 text-teal-300">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-teal-200">
              HEXASCHOOLS
            </span>
          </Link>

          <nav className="hidden gap-1 text-sm text-slate-300 sm:flex">
            <Link href="/schools" className="rounded-lg px-3 py-2 hover:bg-white/[0.06] hover:text-white">
              Instituições
            </Link>
            <a
              href={hexavanteUrl}
              className="rounded-lg px-3 py-2 hover:bg-white/[0.06] hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              Hexavante →
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {session?.user ? (
            <>
              <span className="hidden text-slate-300 sm:inline">{session.user.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-slate-300 hover:bg-white/[0.06] hover:text-white"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-1.5 text-slate-300 hover:text-white">
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-teal-600 px-3 py-1.5 font-medium text-white hover:bg-teal-500"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
