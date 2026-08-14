import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function redirectTarget(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;
  const target = record.redirect_url ?? record.redirect_to;
  return typeof target === "string" ? target : undefined;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = redirectTarget(data);
    if (immediate && !("client" in (data ?? {}))) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-brand-sand flex items-center justify-center p-6">
      <div className="max-w-md bg-white border border-brand-navy/10 rounded-xl p-8">
        <h1 className="font-serif text-2xl text-brand-navy mb-2">Authorization unavailable</h1>
        <p className="text-brand-navy/60 text-sm">
          Could not load this authorization request: {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = (details && "client" in details ? details.client?.name : null) ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorization_id)
      : await supabase.auth.oauth.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = redirectTarget(data);
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen bg-brand-sand flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-brand-navy/10 rounded-xl p-8">
        <div className="size-10 bg-brand-navy rounded flex items-center justify-center text-white font-serif text-lg mb-6">
          K
        </div>
        <h1 className="font-serif text-2xl text-brand-navy mb-2">Connect {clientName} to your account</h1>
        <p className="text-brand-navy/60 text-sm mb-6">
          This lets {clientName} read and update KMSS School data as you, with the same permissions your account has.
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-600 mb-4">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 bg-brand-navy text-white py-3 rounded-sm font-semibold hover:bg-brand-navy/90 disabled:opacity-60"
          >
            {busy ? "Please wait…" : "Approve"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 border border-brand-navy/15 text-brand-navy py-3 rounded-sm font-semibold hover:bg-brand-sand disabled:opacity-60"
          >
            Deny
          </button>
        </div>
      </div>
    </main>
  );
}
