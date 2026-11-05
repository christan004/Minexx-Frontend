import React from "react";
import ReactApexChart from "react-apexcharts";

class ReportPieChart3 extends React.Component {
   constructor(props) {
      super(props);

      this.state = {
        series: [25, 35, 45 , 25, 35],
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
                colors:['#ff7a00', '#2130b8', '#21b830', '#f7284a', '#17d1dc'],
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
         <div id="chart3" className="mb-3">
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

export default ReportPieChart3;
