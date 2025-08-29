// components/Loading.tsx
"use client";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      <div className="mt-3 text-gray-600 text-sm font-medium flex items-center">
        Loading
        <span className="ml-1 flex">
          <span className="animate-bounce delay-0">.</span>
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
        </span>
      </div>
    </div>
  );
}
