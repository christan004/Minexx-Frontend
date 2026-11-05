import React, { Component } from 'react'
import { Bar } from 'react-chartjs-2'


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

class BarChart3 extends Component {
  render() {
    const data = {
      labels: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      datasets: [
        {
          label: 'My First dataset',
          data: [65, 59, 80, 81, 56, 55, 40, 88, 45, 95, 54, 76],
          borderColor: this.props.color ? this.props.color : '#5615a5',
          borderWidth: '0',
          backgroundColor: this.props.color ? this.props.color : '#5615a5',
		  barThickness: 20
        },
      ],
    }

    const options = {
		plugins:{
			legend: false,
			responsive: true,
		},
		maintainAspectRatio: false,
      scales: {
        y: 
          {
            display: false,
            min: 0,
			max: 100,
            ticks: {
              beginAtZero: true,
              stepSize: 10,
              display: false,
            },
            grid: {
              display: false,
              drawBorder: false,
            },
          },
        x: 
          {
            display: false,
            barPercentage: 0.6,
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              display: false,
            },
          },
      },
    }

    return (
      <>
        <Bar
          data={data}
          height={this.props.height ? this.props.height : 100}
          options={options}
        />
      </>
    )
  }
}

export default BarChart3
