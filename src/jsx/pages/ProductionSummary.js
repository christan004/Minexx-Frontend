import React,{} from 'react';
import { Bar } from "react-chartjs-2";
import {Link} from 'react-router-dom';

const ProductionSummary = () => {

    const data = {
        defaultFontFamily: "Poppins",
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
          {
            label: "My First dataset",
            data: [65, 59, 80, 81, 56, 55, 40],
            borderColor: "rgba(64, 24, 157, 1)",
            borderWidth: "0",
            backgroundColor: "#32A9E1",
            // barThickness: 20
          },
        ],
      };
  
      const options = {
       plugins:{
            legend: false,
       },
        scales: {
          y:
            {
              ticks: {
                beginAtZero: true,
              },
            },
          
          x: 
            {
              // Change here
              barPercentage: 0.5,
            },
          
        },
    };

    return (
        <>
            <div className="page-titles">
				<ol className="breadcrumb">
					<li className="breadcrumb-item active"><Link to={"#"}>Dashboard</Link></li>
					<li className="breadcrumb-item"><Link to={"#"} >Production Overview</Link></li>
				</ol>
			</div>
            {/* <div className="row mb-5 align-items-center">
				<div className="col-lg-3 mb-4 mb-lg-0">
					<Link to={"#"} className="btn btn-outline-primary light  btn-lg btn-block rounded" onClick={()=>{} }> + Generate Report</Link>
				</div>
            </div> */}
            <div className="row">
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h4>Mine A</h4>
                        </div>
                        <div className='card-body'>
                            <Bar data={data} height={150} options={options} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h4>Mine B</h4>
                        </div>
                        <div className='card-body'>
                            <Bar data={data} height={150} options={options} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h4>Mine C</h4>
                        </div>
                        <div className='card-body'>
                            <Bar data={data} height={150} options={options} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h4>Mine D</h4>
                        </div>
                        <div className='card-body'>
                            <Bar data={data} height={150} options={options} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h4>Mine E</h4>
                        </div>
                        <div className='card-body'>
                            <Bar data={data} height={150} options={options} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


export default ProductionSummary;