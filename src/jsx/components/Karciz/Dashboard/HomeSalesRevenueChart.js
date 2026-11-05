import React from "react";
import ReactApexChart from "react-apexcharts";


const HomeSalesRevenueChart = (props) => {
    const options = {
        chart: {
			height: 400,
          	type: "line",
			group: 'social',
			toolbar: {
				show: true,
			},
			zoom: {
				enabled: false
			},
        },
        colors:['var(--secondary)','var(--primary)', 'var(--bs-danger)'],
        legend: {
			show: false,
			fontFamily: 'Poppins',
			fontSize: 11,
			fontWeight: 200,
			color: 'white'
		},
        dataLabels: {
			enabled: false,	
		},
        stroke: {
			width: [3, 3, 3],
			colors:['var(--secondary)','var(--primary)', 'var(--bs-danger)'],
			curve: 'smooth',
		},
		markers: {
			size: [2,2,2],
			strokeWidth: [2,2,2],
			strokeColors: ['var(--secondary)','var(--primary)', 'var(--bs-danger)'],
			border:2,
			radius: 1,
			colors:['var(--secondary)','var(--primary)', 'var(--bs-danger)'],
			hover: {
			  size: 2,
			}
		},
		xaxis: {
			categories: props.days,
			labels: {
				style: {
					colors: '#3E4954',
					fontSize: 12,
					fontFamily: 'Poppins',
					fontWeight: 200,					
			  	},
			},
			axisBorder:{
				show: false,
			}
		},
		yaxis: {
			labels: {
				formatter: (value) => {
					return value.toFixed(0)
				},
				minWidth: 20,
				offsetX:-16,
				style: {
				  colors: '#3E4954',
				  fontSize: '12px',
				  fontFamily: 'Poppins',
				  fontWeight: 200,				  
				},
			},
		},
		fill: {
			colors:['var(--secondary)','var(--primary)', 'var(--bs-danger)'],
			type:'gradient',
			opacity: 0.5,
			gradient: {
				shade:'light',
				shadeIntensity: 1,
				colorStops: [ 
				  [
					{
					  offset: 0,
					  color: '#fff',
					  opacity: 0
					},
					{
					  offset: 0.6,
					  color: 'var(--secondary)',
					  opacity: 0
					},
					{
					  offset: 100,
					  color: 'var(--secondary)',
					  opacity: 0
					}
				  ],
				  [
					{
					  offset: 0,
					  color: 'var(--primary)',
					  opacity: .4
					},
					{
					  offset: 50,
					  color: 'var(--primary)',
					  opacity: 0.25
					},
					{
					  offset: 100,
					  color: 'var(--primary)',
					  opacity: 0
					}
				  ],
				  [
					{
					  offset: 0,
					  color: '#fff',
					  opacity: .4
					},
					{
					  offset: 50,
					  color: 'var(--bs-danger)',
					  opacity: 0.25
					},
					{
					  offset: 100,
					  color: 'var(--bs-danger)',
					  opacity: 0
					}
				  ]
				]

		  },
		},
		grid: {
			borderColor: 'rgba(221, 221, 221,0.1)',
			xaxis: {
			  lines: {
				show: true
			  }
			},
			yaxis: {
			  lines: {
				show: true
			  }
			},
		},
		responsive: [{
			breakpoint: 1602,
			options: {
				markers: {
					 size: [4,4,4],
					 hover: {
						size: 5,
					  }
				},
				chart: {
					height: 400,
				},	
			},
			
		}]
	}

	return (
		<div id="activity">
			<ReactApexChart
				options={options}
				series={[
					{
						name: 'Incidents',
						data: props.series1
					},
					{
						name: 'Exports',
						data: props.series2
					},
					{
						name: 'Assessments',
						data: props.series3
					}
				]}
				type="area"
				height={400}
			/>
		</div>
	);
}

export default HomeSalesRevenueChart;
