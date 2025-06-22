'use client';

import { Tree } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EcosystemService } from '@/services/ecosystemService';
import { calculateTreeAge } from '@/lib/utils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AnalyticsDashboardProps {
  trees: Tree[];
}

export function AnalyticsDashboard({ trees }: AnalyticsDashboardProps) {
  if (trees.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-600">Analytics Dashboard</h3>
        <p className="text-sm text-gray-500">Add trees to see beautiful analytics</p>
      </div>
    );
  }

  // Species Distribution Data
  const speciesData = trees.reduce((acc, tree) => {
    const species = tree.commonName || tree.species;
    acc[species] = (acc[species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const speciesChartData = Object.entries(speciesData)
    .map(([species, count]) => ({ species: species.length > 15 ? species.substring(0, 15) + '...' : species, count, fullName: species }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Verification Status Data
  const verificationData = trees.reduce((acc, tree) => {
    acc[tree.verification_status] = (acc[tree.verification_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const verificationChartData = [
    { status: 'Verified', count: verificationData.verified || 0, color: '#15803d' },
    { status: 'Manual', count: verificationData.manual || 0, color: '#2563eb' },
    { status: 'Pending', count: verificationData.pending || 0, color: '#d97706' }
  ].filter(item => item.count > 0);

  // Tree Age Distribution
  const ageGroups = {
    'Young (0-2 years)': 0,
    'Medium (2-5 years)': 0,
    'Mature (5+ years)': 0
  };

  trees.forEach(tree => {
    const age = calculateTreeAge(tree.date_planted);
    const years = age.totalDays / 365;
    if (years < 2) ageGroups['Young (0-2 years)']++;
    else if (years < 5) ageGroups['Medium (2-5 years)']++;
    else ageGroups['Mature (5+ years)']++;
  });

  const ageChartData = Object.entries(ageGroups).map(([group, count]) => ({ group, count }));

  // Growth Trends Over Time (monthly planting data)
  const growthData = trees.reduce((acc, tree) => {
    const date = new Date(tree.date_planted);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const growthChartData = Object.entries(growthData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count], index, array) => {
      const cumulative = array.slice(0, index + 1).reduce((sum, [, c]) => sum + c, 0);
      return { 
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), 
        planted: count,
        cumulative 
      };
    })
    .slice(-12); // Last 12 months

  // Ecosystem Species Data
  const totalEcosystemSpecies = trees.reduce((total, tree) => {
    return total + EcosystemService.getEcosystemSpeciesCount(tree.id);
  }, 0);

  const ecosystemStats = trees.reduce((acc, tree) => {
    const stats = EcosystemService.getEcosystemStatistics(tree.id);
    Object.entries(stats.categoryCounts).forEach(([category, count]) => {
      acc[category] = (acc[category] || 0) + count;
    });
    return acc;
  }, {} as Record<string, number>);

  const ecosystemChartData = Object.entries(ecosystemStats)
    .map(([category, count]) => {
      const categoryInfo = EcosystemService.getCategoryDisplayInfo(category);
      return { 
        category: categoryInfo.label, 
        count, 
        emoji: categoryInfo.emoji,
        color: categoryInfo.color.replace('text-', '')
      };
    })
    .filter(item => item.count > 0);

  // Color palettes
  const SPECIES_COLORS = ['#15803d', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#f0fdfa'];
  const VERIFICATION_COLORS = ['#15803d', '#2563eb', '#d97706'];

  return (
    <div className="space-y-6">
      {/* Growth Trends Chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Tree Planting Trends
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Last 12 Months
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#15803d" 
                  strokeWidth={3}
                  dot={{ fill: '#15803d', strokeWidth: 2, r: 4 }}
                  name="Total Trees"
                />
                <Bar dataKey="planted" fill="#34d399" name="Trees Planted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌳 Species Distribution
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {Object.keys(speciesData).length} Species
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={speciesChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ species, count }) => `${species}: ${count}`}
                    labelLine={false}
                  >
                    {speciesChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SPECIES_COLORS[index % SPECIES_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [value, props.payload.fullName]}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✅ Verification Status
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {((verificationData.verified || 0) / trees.length * 100).toFixed(0)}% Verified
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={verificationChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis dataKey="status" type="category" stroke="#6b7280" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px' 
                    }}
                  />
                  <Bar dataKey="count" fill="#15803d">
                    {verificationChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tree Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌱 Age Distribution
              <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                Maturity Analysis
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="group" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px' 
                    }}
                  />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ecosystem Species */}
        {totalEcosystemSpecies > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌍 Ecosystem Species
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {totalEcosystemSpecies} Total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ecosystemChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ emoji, category, count }) => `${emoji} ${category}: ${count}`}
                      labelLine={false}
                    >
                      {ecosystemChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SPECIES_COLORS[index % SPECIES_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}