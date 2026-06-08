import Link from "next/link";
import {
  canManageAcademics,
  canManageSchool,
  INSTITUTION_ROLE_LABELS,
} from "@/lib/school-permissions";
import type { InstitutionRole } from "@prisma/client";

type NavKey = "dashboard" | "members" | "courses";

type Props = {
  schoolId: string;
  role: InstitutionRole;
  active: NavKey;
};

export function SchoolNav({ schoolId, role, active }: Props) {
  const links: { key: NavKey; href: string; label: string }[] = [
    { key: "dashboard", href: `/schools/${schoolId}`, label: "Painel" },
  ];

  if (canManageSchool(role)) {
    links.push({ key: "members", href: `/schools/${schoolId}/members`, label: "Membros" });
  }

  if (canManageAcademics(role)) {
    links.push({ key: "courses", href: `/schools/${schoolId}/courses`, label: "Cursos" });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
      <nav className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              active === link.key
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-white/10"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-xs text-slate-400">
        {INSTITUTION_ROLE_LABELS[role]}
      </span>
    </div>
  );
}
