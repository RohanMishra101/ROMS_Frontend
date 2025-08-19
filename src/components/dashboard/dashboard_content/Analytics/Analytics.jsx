import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RevenueCard,
  TableUtilization,
} from "./AnalyticsComponents";
import { useAnalyticsData } from "./useAnalyticsData";
import LoadingSkeleton from "./LoadingSkeleton";

export default function Analytics() {
  const {
    data,
    loading,
    error,
    refreshData
  } = useAnalyticsData();

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay error={error} onRetry={refreshData} />;

  return (
    <div className="flex flex-col gap-6 p-4">
      <RevenueCard 
        data={data} 
        onRefresh={refreshData}
      />
{/*       
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopItemsList 
          title="Top 5 Most Ordered Items" 
          items={data.mostOrdered} 
          color="blue"
        />
        <TopItemsList 
          title="Top 5 Least Ordered Items" 
          items={data.leastOrdered} 
          color="red"
        />
      </div> */}

      {/* <PeakHoursChart peakHours={data.peakHours} /> */}
      
      <TableUtilization data={data.tableUtilization} />
    </div>
  );
}