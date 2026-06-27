import { formatDateTime } from "@/lib/utils/format";
import { Badge } from "./Badge";
import type { EntityStatus } from "@/lib/types/entity";

interface AuditLogRowProps {
  id: string;
  action: string;
  entity?: string;
  previousStatus?: string;
  updatedStatus?: string;
  modifiedBy: string;
  modifiedAt: string;
  remarks?: string;
}

export function AuditLogRow({ action, entity, previousStatus, updatedStatus, modifiedBy, modifiedAt, remarks }: AuditLogRowProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-slate-200 last:border-0">
      <div className="w-2 h-2 mt-2 rounded-full bg-red-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
          <div>
            <span className="text-sm font-medium text-slate-900">{action}</span>
            {entity && <span className="text-sm text-slate-500 ml-1.5">— {entity}</span>}
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0">{formatDateTime(modifiedAt)}</span>
        </div>
        {(previousStatus || updatedStatus) && (
          <div className="flex items-center gap-2 mt-1.5">
            {previousStatus && <Badge variant={(previousStatus as EntityStatus) ?? "inactive"} label={previousStatus} dot size="sm" />}
            {previousStatus && updatedStatus && <span className="text-slate-400 text-xs">→</span>}
            {updatedStatus && <Badge variant={(updatedStatus as EntityStatus) ?? "active"} label={updatedStatus} dot size="sm" />}
          </div>
        )}
        <div className="text-xs text-slate-400 mt-1">By {modifiedBy}{remarks && ` · ${remarks}`}</div>
      </div>
    </div>
  );
}
