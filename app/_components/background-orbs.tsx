import { cn } from "@/lib/utils/cn";

export function BackgroundOrbs({
  topLeft = "bg-feature-base opacity-30",
  topRight = "bg-information-base opacity-25",
  bottom = "bg-success-base opacity-20",
  animated = false,
}: {
  topLeft?: string;
  topRight?: string;
  bottom?: string;
  /** Add transition for dynamic color changes */
  animated?: boolean;
}) {
  const base = animated ? "transition-all duration-[2000ms]" : "";
  return (
    <>
      <div
        className={cn(
          "-top-32 -left-32 pointer-events-none absolute size-[400px] rounded-full blur-[100px]",
          base,
          topLeft
        )}
      />
      <div
        className={cn(
          "-right-32 pointer-events-none absolute top-1/3 size-[350px] rounded-full blur-[100px]",
          base,
          topRight
        )}
      />
      <div
        className={cn(
          "-bottom-24 pointer-events-none absolute left-1/4 size-[300px] rounded-full blur-[100px]",
          base,
          bottom
        )}
      />
    </>
  );
}
