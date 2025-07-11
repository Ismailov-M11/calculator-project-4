import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function TariffResultSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
            <div className="space-y-2 flex-1">
              <LoadingSkeleton className="h-5 w-3/4" />
              <LoadingSkeleton className="h-4 w-1/2" />
            </div>
            <div className="space-y-1">
              <LoadingSkeleton className="h-7 w-24" />
              <LoadingSkeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
