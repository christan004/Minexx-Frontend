import React, { Component } from "react";
import { Line } from "react-chartjs-2";

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

class IncomeChart extends Component {
   render() {
      const data = {
			defaultFontFamily: 'Poppins',
			labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
			datasets: [
				{
					label: "My First dataset",
					data: [0, 20, 60, 62, 50, 45, 65],
					borderColor: 'rgba(19, 180, 151, 1)',
					borderWidth: "2",
					tension:0.3,
					backgroundColor: 'transparent', 
					pointBackgroundColor: 'rgba(54, 201, 95, 0.5)'
				}, {
					label: "My First dataset",
					data: [30, 20, 20, 20, 35, 65, 45],
					borderColor: 'rgba(217, 183, 95, 1)',
					borderWidth: "2",
					tension:0.3,
					backgroundColor: 'transparent', 
					pointBackgroundColor: 'rgba(254, 176, 25, 1)'
				}
			]
      };
		const options = {
			plugins:{
				legend: {
					display: false
				},
				title: {
					display: false
				},
				tooltips: {
					intersect: false,
					mode: "nearest",
					padding:10,
					caretPadding: 10
				}, 
				
				responsive: false,
				
				hover: {
					mode: "index"
				},
			},
			maintainAspectRatio: false,
			scales: {
				x: {
					display: false,
					gridLines: false,
					scaleLabel: {
						display: false,
						labelString: "Month"
					}
				},
				y: {
					display: false,
					gridLines: false,
					scaleLabel: {
						display: false,
						labelString: "Value"
					},
					ticks: {
						beginAtZero: 0
					}
				}
			},
			elements: {
				point: {
					radius: 0,
					borderWidth: 0
				}
			},
			layout: {
				padding: {
					left: 0,
					right: 0,
					top: 5,
					bottom: 0
				}
			}
		};

      return (
         <>
            <Line data={data} height={60} options={options} />
         </>
      );
   }
}

export default IncomeChart;
