import React, { Component } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


class LineChart3 extends Component {
  render() {
    const data = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'My First dataset',
          data: [28, 35, 36, 48, 46, 42, 60],
          backgroundColor: this.props.color ? this.props.color : '#5514A4',
          borderColor: this.props.borderColor
            ? this.props.borderColor
            : this.props.color
            ? this.props.color
            : '#5514A4',
          borderWidth: 0,
          strokeColor: this.props.borderColor
            ? this.props.borderColor
            : this.props.color
            ? this.props.color
            : '#5514A4',
          capBezierPoints: !0,
          pointColor: this.props.borderColor
            ? this.props.borderColor
            : this.props.color
            ? this.props.color
            : '#fff',
          pointBorderColor: this.props.borderColor
            ? this.props.borderColor
            : this.props.color
            ? this.props.color
            : '#fff',
          pointBackgroundColor: this.props.borderColor
            ? this.props.borderColor
            : this.props.color
            ? this.props.color
            : '#5514A4',
          borderWidth2: 2,
          pointBorderWidth: 0,
          pointRadius: 3,
          pointHoverBorderColor: this.props.color
            ? this.props.color
            : '#5514A4',
          pointHoverRadius: 0,
          pointStyle: 'line',
		  fill:true,
		  tension:0.4
        },
      ],
    }

    const options = {
      plugins:{
		  responsive: true,
		  tooltips: {
			enabled: true,
		  },
		  legend: {
			display: false,
			labels: {
			  usePointStyle: false,
			},
		  },
		  title: {
			display: true,
		  },
	  },
		  maintainAspectRatio: false,
      scales: {
        x: 
          {
            display: false,
            gridLines: {
              display: false,
              drawBorder: false,
            },
            scaleLabel: {
              display: false,
              labelString: 'Month',
            },
            ticks: {
              beginAtZero: true,
            },
          },
        
        y: 
          {
            display: false,
            gridLines: {
              display: false,
              drawBorder: false,
            },
            scaleLabel: {
              display: true,
              labelString: 'Value',
            },
          },
        
      },
      
    }
    return (
      <>
        <Line
          data={data}
          options={options}
          height={this.props.height ? this.props.height : 300}
        />
      </>
    )
  }
}

export default LineChart3
