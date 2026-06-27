import { FileX } from "lucide-react";

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message = "No data found", icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="p-4 rounded-full bg-slate-800/60 mb-4">
        {icon ?? <FileX className="w-8 h-8 text-slate-500" />}
      </div>
      <p className="text-slate-400 text-sm font-medium">{message}</p>
      <p className="text-slate-600 text-xs mt-1">Try adjusting your search or filters</p>
    </div>
  );
}
