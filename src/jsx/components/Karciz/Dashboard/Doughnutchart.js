import React, { Component } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from "react-chartjs-2";
ChartJS.register(ArcElement, Tooltip, Legend);

const Doughnutchart = ({input})=> {
	
	const data = {
		defaultFontFamily: 'Poppins',
		weight: 5,
		datasets: [{
			data: input,
			borderWidth: 5, 
			borderColor: "rgba(47,54,61,1)",
			backgroundColor: [
				"rgba(176, 54, 54, 1)",
				"rgba(43, 193, 85, 1)",
				"rgba(255, 171, 45, 1)",
				"rgba(60, 101, 245, 1)",
				"rgba(50, 169, 225, 1)",
				"rgba(255, 255, 255, 1)",
				"rgba(208, 116, 7, 1)"
			],
			hoverBackgroundColor: [
				"rgba(176, 54, 54, 0.5)",
				"rgba(43, 193, 85, 0.5)",
				"rgba(255, 171, 45, 0.5)",
				"rgba(60, 101, 245, 0.5)",
				"rgba(50, 169, 225, 0.5)",
				"rgba(255, 255, 255, 0.5)",
				"rgba(208, 116, 7, 0.5)"
			]

		}],
	};
	const options = {
		plugins:{
			responsive: true,
				
		},	
		cutout: '50%',
		weight: 1,	
		//cutoutPercentage: 60,
		
		maintainAspectRatio: true
	};

	return (
		<>
		<Doughnut data={data} height={100} options={options} />
		</>
	);
}

export default Doughnutchart;
