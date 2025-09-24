import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Box, Typography } from '@mui/material';
import { IPieChartProps } from '../../../interfaces/dashboard';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart: React.FC<IPieChartProps> = ({
  data,
  title,
  width = 300,
  height = 300,
  showLegend = true,
  showTooltip = true
}) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 1,
        hoverBorderWidth: 2,
        hoverBorderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        enabled: showTooltip,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}
    >
      {title && (
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom 
          fontWeight="bold"
          textAlign="center"
        >
          {title}
        </Typography>
      )}
      <Box 
        sx={{ 
          width: width, 
          height: height,
          position: 'relative'
        }}
      >
        <Pie data={chartData} options={options} />
      </Box>
    </Box>
  );
};

export default PieChart;
