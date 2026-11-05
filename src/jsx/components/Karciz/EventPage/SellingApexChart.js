import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

const SellingApexChart = ({chart})=>{
	
	const [values, setvalues] = useState(chart.values)
  	const [keys, setkeys] = useState(chart.keys)

	useEffect(() => {
		setvalues(chart.values)
		setkeys(chart.keys)
	}, [chart])
	

	return (
		<div id="lineChart">
			<ReactApexChart
				options={{
					chart: {
						height: 350,
						type: "bar",
						stacked: true,
							toolbar: {
							show: false,
						},
					},
					plotOptions: {
						bar: {
							borderRadius: 6,	
							columnWidth: "25%",
							startingShape: "rounded",				
							colors: {
								backgroundBarColors: ['#f0f5f2', '#f0f5f2', '#f0f5f2', '#f0f5f2','#f0f5f2','#f0f5f2','#f0f5f2','#f0f5f2'],
								backgroundBarOpacity: 1,
								backgroundBarRadius: 5,
							},
				
						},
						distributed: true
					},
					colors:['#32A9E1'],
					legend: {
						show: false
					},
					fill: {
						opacity: 1,
					},
					dataLabels: {
						enabled: false,
						colors: ['#000'],
						dropShadow: {
							enabled: true,
							top: 1,
							left: 1,
							blur: 1,
							opacity: 1
						}
					},
					stroke: {
						show: true,
						width: 1,
						colors: ['transparent'],
						
					},
					grid: {
						borderColor:'#f0f5f2'
					},
					
					xaxis: {
						categories: keys,
						labels: {
							style: {
								colors: '#787878',
								fontSize: '13px',
								fontFamily: 'poppins',
								fontWeight: 100,
								cssClass: 'apexcharts-xaxis-label',
							},
						},
						crosshairs: {
							show: false,
						},
						axisBorder: {
							show: false,
						},
					},
					tooltip: {
						x: {
							show: true
						}
					}}
				}
				series={[{
					name: "Weight in TONS",
					data: values
				}]}
				type="bar"
				height={350}
			/>
		</div>
	);
}

export default SellingApexChart;
