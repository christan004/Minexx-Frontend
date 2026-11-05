import React from "react";
import { Line } from "react-chartjs-2";
import "chartjs-plugin-streaming";
var createReactClass = require("create-react-class");

const data = {
   datasets: [
      {
         label: "My First dataset",
         pointBackgroundColor: "#fff",
         borderColor: "#435EE0",
         backgroundColor: "#435EE0",
         lineTension: 0,
         data: [],
         pointBorderWidth: 0,
         pointRadius: 0,
		 fill:true
      },
   ],
};

const options = {
   plugins:{
	   tooltips: {
		  enabled: false,
	   },
	   legend: {
		  display: false,
	   },
	   title: {
		  display: false,
	   },
   },
   scales: {
      y:
         {
            display: false,
         },
      
      x: 
         {
            display: false,
            //type: "realtime",
            realtime: {
               onRefresh: function () {
                  data.datasets[0].data.push({
                     x: Date.now(),
                     y: Math.random() * 100,
                  });
               },
               delay: 2000,
            },
         },
      
   },
   
};

export default createReactClass({
   displayName: "LineExample",
   render() {
      return (
         <div>
            <Line data={data} options={options} height={100} />
         </div>
      );
   },
});
