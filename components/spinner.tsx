"use client";

interface SpinnerProps {
  size?: "page" | "small";
}

export function Spinner({ size }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center flex-1">
      <div
        className={`inline-block ${
          size === "small" ? "h-6 w-6" : "h-12 w-12"
        } animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
        role="status"
      ></div>
    </div>
  );
}
