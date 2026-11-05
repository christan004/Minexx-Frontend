import React from "react";
import ReactApexChart from "react-apexcharts";

class ReportPieChart2 extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
        series: [75, 25],
		options: {
            chart: {
                width: 220,
				height: 220,
				type: 'donut',
				sparkline: {
					enabled: true,
				},
            },
            fill : {
                colors:['#ff7a00',  '#21b830'],
            },
            
            plotOptions: {
                donutChart : {
					customScale: 1,
					donut: {
						size: '70%'						
					}
				}
            },
            dataLabels: {
				enabled: false
			},
            legend: {
				show: false
			},
            responsive: [{
				breakpoint: 1300,
				options: {
					chart: {
						width: 120,
						height: 120
					},
				}
			}],
            
         },
      };
   }

   render() {
      return (
         <div id="chart2" className="d-flex justify-content-center mb-3">
            <ReactApexChart
               options={this.state.options}
               series={this.state.series}
               type="donut"
               height={220}
               width={220}
            />
         </div>
      );
   }
}

export default ReportPieChart2;
