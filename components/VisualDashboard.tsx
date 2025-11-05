'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface VisualDashboardProps {
  balances: any[]
  portfolioData: any
}

const COLORS = [
  '#6B7280',
  '#9CA3AF',
  '#D1D5DB',
  '#E5E7EB',
  '#F3F4F6',
  '#9CA3AF',
  '#6B7280',
  '#4B5563',
  '#374151',
  '#1F2937',
]

export default function VisualDashboard({
  balances,
  portfolioData,
}: VisualDashboardProps) {
  if (!balances || balances.length === 0 || !portfolioData) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Token Allocation</h2>
        <p className="text-gray-400">Enter a wallet address to view chart</p>
      </div>
    )
  }

  const pieData = portfolioData.portfolioData
    .filter((item: any) => item.value > 0)
    .map((item: any) => ({
      name: item.symbol,
      value: item.value,
    }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Token Allocation</h3>
      {pieData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#6B7280"
              dataKey="value"
            >
              {pieData.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                `$${value.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              }
              contentStyle={{
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#ffffff',
              }}
              labelStyle={{
                color: '#ffffff',
              }}
              itemStyle={{
                color: '#ffffff',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-400">No data available for chart</p>
      )}
    </div>
  )
}

