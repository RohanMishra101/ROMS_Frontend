// src/components/dashboard/dashboard_content/Analytics/LoadingSkeleton.jsx
export default function LoadingSkeleton() {
    return (
      <div className="flex flex-col gap-6 p-4">
        {/* Revenue Card Skeleton */}
        <div className="bg-gray-200 rounded-xl p-6 h-24 animate-pulse"></div>
        
        {/* Top Items Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-200 rounded-xl p-6 h-64 animate-pulse"></div>
          <div className="bg-gray-200 rounded-xl p-6 h-64 animate-pulse"></div>
        </div>
  
        {/* Charts Skeletons */}
        <div className="bg-gray-200 rounded-xl p-6 h-96 animate-pulse"></div>
        <div className="bg-gray-200 rounded-xl p-6 h-96 animate-pulse"></div>
      </div>
    );
  }