export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      {/* Animated spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="w-8 h-8 border-4 border-transparent border-t-blue-400 rounded-full animate-spin absolute top-2 left-2"></div>
      </div>
      
      {/* Loading text with animated dots */}
      <div className="mt-4 text-gray-600 text-lg font-medium flex items-center">
        Loading incidents
        <span className="ml-1 flex">
          <span className="animate-bounce delay-0">.</span>
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="mt-6 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
      </div>
      
      {/* Optional skeleton loader preview */}
      <div className="mt-8 w-full max-w-md space-y-3">
        <div className="h-4 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded-full animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-full animate-pulse w-1/2"></div>
      </div>
    </div>
  );
}