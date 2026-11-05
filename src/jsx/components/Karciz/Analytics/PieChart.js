import React, { Component } from "react";
import { Pie } from "react-chartjs-2";

const PieChart = ({ levels }) => {
	const data = {
		defaultFontFamily: 'Poppins',
		labels: ["Low","Medium/Moderate","High", "Fatal/Very High"],
		datasets: [
			{
				data: [levels.low, levels.medium, levels.high, levels.fatal],
				borderWidth: 0, 
				backgroundColor: [
					"#FFFF00",
					"#FFD580",
					"#FF8C00",
					"#FF0000"
				],
				hoverBackgroundColor: [
					"#FFFF00",
					"#FFD580",
					"#FF8C00",
					"#FF0000"
				]
			}
		]
	};
	const options = {
		plugins:{
			responsive: true, 
			legend: false, 
			maintainAspectRatio: false
		}
	};

	return (
		<>
		<Pie data={data} height={100} options={options} />
		</>
	);
}

export default PieChart;
