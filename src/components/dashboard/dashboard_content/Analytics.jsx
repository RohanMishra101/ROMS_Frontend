// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Bar, Doughnut } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement
// );

// const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// export default function Analytics() {
//   const [revenue, setRevenue] = useState(0);
//   const [mostOrdered, setMostOrdered] = useState([]);
//   const [leastOrdered, setLeastOrdered] = useState([]);
//   const [peakHours, setPeakHours] = useState([]);
//   const [tableUtilization, setTableUtilization] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem("token");
//         const headers = { Authorization: `Bearer ${token}` };

//         const [revRes, mostRes, leastRes, peakRes, tableRes] = await Promise.all([
//           axios.get("http://localhost:3000/api/dashboard/revenue", { headers }),
//           axios.get("http://localhost:3000/api/dashboard/most-ordered", { headers }),
//           axios.get("http://localhost:3000/api/dashboard/least-ordered", { headers }),
//           axios.get("http://localhost:3000/api/dashboard/peak-hours", { headers }),
//           axios.get("http://localhost:3000/api/dashboard/table-utilization", { headers }),
//         ]);

//         setRevenue(revRes.data.totalRevenue);
//         setMostOrdered(mostRes.data);
//         setLeastOrdered(leastRes.data);
//         setPeakHours(peakRes.data);
//         setTableUtilization(tableRes.data);
//       } catch (err) {
//         console.error("Analytics fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const peakChartData = {
//     labels: peakHours.map(
//       (p) => `${dayNames[p._id.dayOfWeek - 1]} ${p._id.hour}:00`
//     ),
//     datasets: [
//       {
//         label: "Orders Count",
//         data: peakHours.map((p) => p.orderCount),
//         backgroundColor: "rgba(59, 130, 246, 0.7)",
//         borderColor: "rgba(59, 130, 246, 1)",
//         borderWidth: 1,
//         borderRadius: 6,
//       },
//     ],
//   };

//   const tableChartData = {
//     labels: tableUtilization.map((t) => `Table ${t.tableNumber}`),
//     datasets: [
//       {
//         label: "Utilization %",
//         data: tableUtilization.map((t) => t.utilizationPercent),
//         backgroundColor: [
//           "rgba(239, 68, 68, 0.7)",
//           "rgba(59, 130, 246, 0.7)",
//           "rgba(253, 224, 71, 0.7)",
//           "rgba(16, 185, 129, 0.7)",
//           "rgba(139, 92, 246, 0.7)",
//         ],
//         borderColor: "rgba(255,255,255,0.8)",
//         borderWidth: 1,
//       },
//     ],
//   };

//   const cardClass = "bg-white rounded-xl p-6 shadow-lg border border-gray-200";

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-6 p-4">
//       {/* Revenue Card */}
//       <div className={cardClass}>
//         <h2 className="text-2xl font-bold mb-2 text-gray-800">Total Revenue</h2>
//         <p className="text-4xl font-extrabold text-blue-600">
//           ${revenue.toLocaleString()}
//         </p>
//         <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
//       </div>

//       {/* Top Items */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className={cardClass}>
//           <h2 className="text-xl font-semibold mb-3 text-gray-800">Top 5 Most Ordered Items</h2>
//           <ul className="space-y-2">
//             {mostOrdered.map((item) => (
//               <li key={item._id} className="flex justify-between items-center">
//                 <span className="font-medium text-gray-700">{item.foodName}</span>
//                 <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
//                   {item.totalQuantity} orders
//                 </span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className={cardClass}>
//           <h2 className="text-xl font-semibold mb-3 text-gray-800">Top 5 Least Ordered Items</h2>
//           <ul className="space-y-2">
//             {leastOrdered.map((item) => (
//               <li key={item._id} className="flex justify-between items-center">
//                 <span className="font-medium text-gray-700">{item.foodName}</span>
//                 <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
//                   {item.totalQuantity} orders
//                 </span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {/* Peak Hours */}
//       <div className={cardClass}>
//         <h2 className="text-xl font-semibold mb-4 text-gray-800">Peak Hours</h2>
//         <div className="h-80"> {/* Fixed height container */}
//           <Bar
//             data={peakChartData}
//             options={{
//               responsive: true,
//               maintainAspectRatio: false,
//               plugins: {
//                 legend: { 
//                   labels: { 
//                     font: { size: 14 },
//                     color: "#374151"
//                   } 
//                 },
//                 tooltip: {
//                   bodyFont: { size: 14 },
//                   titleFont: { size: 16 }
//                 }
//               },
//               scales: {
//                 x: { 
//                   ticks: { 
//                     color: "#4B5563", 
//                     font: { size: 12 } 
//                   }, 
//                   grid: { 
//                     color: "rgba(0,0,0,0.05)" 
//                   } 
//                 },
//                 y: { 
//                   ticks: { 
//                     color: "#4B5563", 
//                     font: { size: 12 } 
//                   }, 
//                   grid: { 
//                     color: "rgba(0,0,0,0.05)" 
//                   },
//                   beginAtZero: true
//                 },
//               },
//             }}
//           />
//         </div>
//         <p className="text-sm text-gray-500 mt-2">
//           Shows busiest hours across all days of the week
//         </p>
//       </div>

//       {/* Table Utilization */}
//       <div className={`${cardClass} grid grid-cols-1 md:grid-cols-2 gap-4`}>
//         <div>
//           <h2 className="text-xl font-semibold mb-4 text-gray-800">Table Utilization</h2>
//           <p className="text-sm text-gray-600 mb-4">
//             Percentage of time each table was occupied
//           </p>
//           <ul className="space-y-2">
//             {tableUtilization.map((table) => (
//               <li key={table.tableNumber} className="flex items-center">
//                 <span className="inline-block w-3 h-3 rounded-full mr-2" 
//                       style={{ backgroundColor: tableChartData.datasets[0].backgroundColor[table.tableNumber % 5] }}></span>
//                 <span className="font-medium text-gray-700">Table {table.tableNumber}:</span>
//                 <span className="ml-auto font-semibold">{table.utilizationPercent}%</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div className="flex items-center justify-center">
//           <div className="w-64 h-64"> {/* Fixed size for donut */}
//             <Doughnut
//               data={tableChartData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                   legend: { 
//                     position: 'right',
//                     labels: {
//                       font: { size: 12 },
//                       color: "#374151",
//                       boxWidth: 12,
//                       padding: 16
//                     }
//                   },
//                   tooltip: {
//                     bodyFont: { size: 14 },
//                     titleFont: { size: 16 }
//                   }
//                 },
//                 cutout: '65%'
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }