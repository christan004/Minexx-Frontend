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
class TicketChart extends Component {
   render() {
      const data = {
			defaultFontFamily: 'Poppins',
			labels: ["January", "February", "March", "April", "May"],
			datasets: [{
				label: "Sales Stats",
				backgroundColor: ['rgba(19, 180, 151, 0.1)'],
				borderColor: '#32A9E1',
				pointBackgroundColor: '#32A9E1',
				pointBorderColor: '#32A9E1',
				borderWidth:4,
				borderRadius:10,
				tension:0.5, 
				fill: true,
				pointHoverBackgroundColor: '#32A9E1',
				pointHoverBorderColor: '#32A9E1',
				data: [0, 2, 4 ,3,6]
			}]
      };
		const options = {
			//bezierCurve: true,
			plugins:{
				legend: {
					display: false
				},
				title: {
					display: false
				},
				tooltip: {
					intersect: false,
					mode: "nearest",
					//xPadding: 10,
					//yPadding: 10,
					padding:10,
					caretPadding: 10
				},
				responsive: !0,
				maintainAspectRatio: !1,
				hover: {
					mode: "index"
				},
			},
			/* title: {
				display: !1
			}, */
			/* tooltips: {
				intersect: !1,
				mode: "nearest",
				xPadding: 10,
				yPadding: 10,
				caretPadding: 10
			}, */
			/* legend: {
				display: false
			}, */
			//responsive: !0,
			//maintainAspectRatio: !1,
			/* hover: {
				mode: "index"
			}, */
			scales: {
				x: {
					display: !1,
					gridLines: !1,
					scaleLabel: {
						display: !0,
						labelString: "Month"
					}
				},
				y:{
					display: !1,
					gridLines: !1,
					scaleLabel: {
						display: !0,
						labelString: "Value"
					},
					ticks: {
						beginAtZero: false
					}
				}
			},
			elements: {
				point: {
					radius: 0,
					borderWidth: 0
				},
				line: {
					tension: 0
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
            <Line data={data} height={85} options={options} />
         </>
      );
   }
}

export default TicketChart;
