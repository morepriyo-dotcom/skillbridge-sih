'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface SkillGapItem {
  skill: string;
  userScore: number;
  industryBenchmark: number;
}

interface SkillRadarChartProps {
  data?: SkillGapItem[];
  className?: string;
}

const defaultData: SkillGapItem[] = [
  { skill: 'Data Analysis', userScore: 80, industryBenchmark: 85 },
  { skill: 'Clinical Research', userScore: 70, industryBenchmark: 90 },
  { skill: 'Herbal Medicine', userScore: 95, industryBenchmark: 75 },
  { skill: 'Pharmacognosy', userScore: 85, industryBenchmark: 80 },
  { skill: 'Ayurvedic Diagnostics', userScore: 90, industryBenchmark: 85 },
  { skill: 'Research Methodology', userScore: 65, industryBenchmark: 80 },
];

export function SkillRadarChart({ data = defaultData, className }: SkillRadarChartProps) {
  return (
    <div className={className || 'w-full h-[360px]'}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="var(--hairline)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'var(--ink-muted)', fontSize: 10 }}
          />
          <Radar
            name="Your Competency"
            dataKey="userScore"
            stroke="#0099ff"
            fill="#0099ff"
            fillOpacity={0.4}
          />
          <Radar
            name="Industry Benchmark"
            dataKey="industryBenchmark"
            stroke="#6a4cf5"
            fill="#6a4cf5"
            fillOpacity={0.25}
          />
          <Legend
            wrapperStyle={{
              paddingTop: 10,
              fontSize: 12,
              color: 'var(--ink)',
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-1)',
              borderColor: 'var(--hairline)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--ink)',
              fontSize: '12px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
