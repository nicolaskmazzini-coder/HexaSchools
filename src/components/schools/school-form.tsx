"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/app/actions/school";

const initialState: ActionResult = { success: false };

type Props = {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  children: React.ReactNode;
};

export function SchoolForm({ action, submitLabel, children }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-6">
      {children}
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-400">Salvo com sucesso!</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-60"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
