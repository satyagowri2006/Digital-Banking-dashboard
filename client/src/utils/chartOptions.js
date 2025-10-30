// Reusable default chart options for Chart.js or react-chartjs-2

export const defaultChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    title: {
      display: false,
      text: '',
    },
  },
  elements: {
    line: { tension: 0.3 },
    point: { radius: 4 },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { display: true },
    },
    x: {
      grid: { display: false },
    },
  },
};
