"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Loads data with `loader`, exposing loading / error state and `reload()`.
 * `deps` are the values the loader depends on (ids, filters); they must be
 * serialisable, and the loader re-runs when they change.
 */
export function useLoad<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{ data: T | null; error: string; loading: boolean }>({
    data: null,
    error: "",
    loading: true,
  });
  const [version, setVersion] = useState(0);
  const key = JSON.stringify(deps);

  useEffect(() => {
    let cancelled = false;
    loader().then(
      data => !cancelled && setState({ data, error: "", loading: false }),
      e => !cancelled && setState(s => ({ ...s, error: errorText(e), loading: false })),
    );
    return () => {
      cancelled = true;
    };
    // The loader is re-created every render; `key` and `version` decide when it runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);

  const reload = useCallback(() => {
    setState(s => ({ ...s, loading: true }));
    setVersion(v => v + 1);
  }, []);

  return { data: state.data, error: state.error, loading: state.loading, reload };
}

/** Records a console change in admin_audit_log. Never blocks the change itself. */
export async function audit(action: string, entity: string, entityId: string | null, details?: object) {
  try {
    const { data } = await supabase().auth.getUser();
    if (!data.user) return;
    await supabase().from("admin_audit_log").insert({
      admin_id: data.user.id,
      admin_email: data.user.email,
      action,
      entity,
      entity_id: entityId,
      details: details ?? null,
    });
  } catch {
    // Auditing is best-effort.
  }
}

/** Short-lived link to a private storage object (bills, reports). */
export async function signedUrl(bucket: string, path: string) {
  const { data, error } = await supabase().storage.from(bucket).createSignedUrl(path, 600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function openFile(bucket: string, path: string) {
  window.open(await signedUrl(bucket, path), "_blank", "noopener");
}
