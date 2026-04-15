import React, { useMemo } from "react";
import { Donor, DashboardData } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, DollarSign, TrendingUp, Activity } from "lucide-react";

interface DashboardStatsProps {
  donors: Donor[];
  dashboardData?: DashboardData | null;
}

const COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#6366f1"];

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  donors,
  dashboardData,
}) => {
  const stats = useMemo(() => {
    // Prefer API-provided dashboardData when available
    if (dashboardData) {
      const totalRaised = dashboardData.totalAmount ?? 0;
      const avgDonation = dashboardData.avgAmount ?? 0;

      const chartData = (dashboardData.topByDate || []).map((r) => {
        const rawDate = r.EntryDate || r.Entry_Date || "";
        const name = rawDate
          ? new Date(rawDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          : "";
        return { name, amount: r.total };
      });

      const ageChartData = [
        { name: "18-30", value: dashboardData.ages?.under30 ?? 0 },
        { name: "31-50", value: dashboardData.ages?.between30and49 ?? 0 },
        { name: "51-65", value: dashboardData.ages?.between50and64 ?? 0 },
        { name: "65+", value: dashboardData.ages?.over65 ?? 0 },
      ];

      return { totalRaised, avgDonation, chartData, ageChartData };
    }

    // Fallback to donors client-side data
    const totalRaised = donors.reduce((acc, curr) => acc + curr.amount, 0);
    const avgDonation = donors.length > 0 ? totalRaised / donors.length : 0;

    // Group by Date (Last 7 entries)
    const sortedByDate = [...donors].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const dailyDataMap = new Map<string, number>();
    sortedByDate.forEach((d) => {
      const dateStr = new Date(d.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      dailyDataMap.set(dateStr, (dailyDataMap.get(dateStr) || 0) + d.amount);
    });
    const chartData = Array.from(dailyDataMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .slice(-7);

    const ageGroups = {
      "18-30": 0,
      "31-50": 0,
      "51-65": 0,
      "65+": 0,
    };
    donors.forEach((d) => {
      if (d.age) {
        if (d.age <= 30) ageGroups["18-30"]++;
        else if (d.age <= 50) ageGroups["31-50"]++;
        else if (d.age <= 65) ageGroups["51-65"]++;
        else ageGroups["65+"]++;
      }
    });
    const ageChartData = Object.entries(ageGroups).map(([name, value]) => ({
      name,
      value,
    }));

    return { totalRaised, avgDonation, chartData, ageChartData };
  }, [donors, dashboardData]);

  return (
    <div className="space-y-6">
      {/* Top Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-slate-500">Total Raised</p>
            <DollarSign className="h-4 w-4 text-sheriff-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ${stats.totalRaised.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">
            +12% from last month
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-slate-500">
              Total Supporters
            </p>
            <Users className="h-4 w-4 text-sheriff-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {dashboardData?.distinctDonors?.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across 3 counties</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-slate-500">
              Avg. Contribution
            </p>
            <TrendingUp className="h-4 w-4 text-sheriff-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ${Math.round(stats.avgDonation)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Per supporter</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between pb-2">
            <p className="text-sm font-medium text-slate-500">
              Campaign Status
            </p>
            <Activity className="h-4 w-4 text-sheriff-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">Active</div>
          <p className="text-xs text-emerald-600 mt-1">Growth phase</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Fundraising Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value: number) => `$${value}`}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Supporter Demographics (Age)
          </h3>
          <div className="h-[300px] w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.ageChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.ageChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
