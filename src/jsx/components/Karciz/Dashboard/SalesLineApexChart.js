import React from "react";
import ReactApexChart from "react-apexcharts";


class SalesLineApexChart extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
			series: [
				{
					name: 'Net Profit',
					data: [0, 4, 2, 5, 6],
					/* radius: 30,	 */
				}, 
			],
			options: {
				chart: {
					type: 'line',
					height: 60,
					width: 100,
					toolbar: {
						show: false,
					},
					zoom: {
						enabled: false
					},
					sparkline: {
						enabled: true
					}
					
				},
				hover: {
					mode: "index"
				},
				colors:['var(--primary)'],
				dataLabels: {
					enabled: false,
				},

				legend: {
					show: false,
				},
				stroke: {
					show: true,
					width: 4,
					curve:'smooth',
					colors:['var(--primary)'],
				},
				
				grid: {
					show:false,
					borderColor: '#000',
					padding: {
						top: 0,
						right: 0,
						bottom: 0,
						left: 0

					}
				},
				states: {
					normal: {
						filter: {
							type: 'none',
							value: 0
						}
					},
					hover: {
						filter: {
							type: 'none',
							value: 0
						}
					},
					active: {
						allowMultipleDataPointsSelection: false,
						filter: {
							type: 'none',
							value: 0
						}
					}
				},
				xaxis: {
					categories: ["January", "February", "March", "April", "May"],
					axisBorder: {
						show: false,
					},
					axisTicks: {
						show: false
					},
					labels: {
						show: false,
						style: {
							fontSize: '12px',
						}
					},
					crosshairs: {
						show: false,
						position: 'front',
						stroke: {
							width: 1,
							dashArray: 3
						}
					},
					 tooltip: {
						enabled: true,
						formatter: undefined,
						offsetY: 0,
						style: {
							fontSize: '12px',
						}
					} 					
				},
				yaxis: {
					display: !1,
					gridLines: !1,
					scaleLabel: {
						display: !0,
						labelString: "Value"
					},
					ticks: {
						beginAtZero: !0
					}
				},
				fill: {
				  opacity: 1,
				  colors:'#FB3E7A'
				},
				tooltip: {
					enabled:true,
					style: {
						fontSize: '12px',
					},
					y: {
						formatter: function(val) {
							return "$" + val + " thousands"
						}
					}
				}
			
			},
		};
	}

	render() {
		return (
			<div id="chart" >
				<ReactApexChart
				  options={this.state.options}
				  series={this.state.series}
				  type="line"
				  height={60}
				  width={500}
				/>
			</div>
		);
	}
}

export default SalesLineApexChart;
