import React, { Component } from "react";
import { Line } from "react-chartjs-2";



/* import {
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
); */

class SalesRevenueChart extends Component {
   render() {
			
		const data = {
			defaultFontFamily: "Poppins",
			labels: ["Jan", "Febr", "Mar", "Apr", "May", "Jun", "Jul"],
			datasets: [
				{
					label: "My First dataset",
					data: [25, 20, 60, 41, 66, 45, 80],
					borderColor: 'rgba(19, 180, 151, 1)',
					borderWidth: "2",
					backgroundColor: 'transparent',
					pointBackgroundColor: 'transparent',
					pointBorderColor:'transparent',
					pointHoverBackgroundColor:'rgba(19,180,151,1)',
					pointBorderWidth:30,
					pointHoverRadius: 10,
					tension:0.3
				}
			]
		};
		const options = {
			responsive: true,
			plugins:{
				legend: false,
			},
			//maintainAspectRatio:true,
			scales: {
				y: {
					beginAtZero: true, 						 
					min: 0,
					max: 100, 
					color: "rgba(255, 255, 255,1)",
					ticks: {
						stepSize: 20, 
						padding: 5								
					},
					grid: {
						color: "rgba(255, 255, 255,0.05)",
						drawBorder: true
					}
				},
				x: {
					ticks: {
						padding: 1
					},
					grid: {
						color: "rgba(255, 255, 255,0.05)",
						drawBorder: true
					}
				},
				
				
			}
		};

      return (
         <>
            <Line data={data} height={150} options={options} />
         </>
      );
   }
}

export default SalesRevenueChart;
