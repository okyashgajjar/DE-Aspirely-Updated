import { Skeleton } from "@/components/ui/skeleton";

export default function ChatbotLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col gap-4">
      <Skeleton className="h-[70vh] w-full rounded-xl" />
    </div>
  );
}

