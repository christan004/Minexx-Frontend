import React from 'react';
import {Link} from 'react-router-dom';
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
//import { LazyLoadImage } from 'react-lazy-load-image-component';

// Import Swiper styles
import "swiper/css";

import "swiper/css/pagination";

// import Swiper core and required modules
import { Autoplay } from "swiper";

//SwiperCore.use([EffectCoverflow,Pagination]);

import pic1 from '../../../../../images/product/1.jpg';
import pic2 from '../../../../../images/product/2.jpg';
import pic3 from '../../../../../images/product/3.jpg';
import pic4 from '../../../../../images/product/4.jpg';
import pic5 from '../../../../../images/product/5.jpg';
import pic6 from '../../../../../images/product/6.jpg';

const dataBlog = [
	{image: pic1, price:'30'},
	{image: pic2, price:'40'},
	{image: pic3, price:'25'},
	{image: pic4, price:'35'},
	{image: pic5, price:'20'},
	{image: pic6, price:'10'},
];

const SimilarSlider = () => {    
    return (
        <>
            <Swiper className="card-slider"						
				speed= {1500}
				slidesPerView= {5}
				spaceBetween= {20}
				loop={false}
				autoplay= {{
				   delay: 3000,
				}}
               
				modules={[ Autoplay,  ]}
				breakpoints = {{
					
                    1401: {
                        slidesPerView: 5,
                    },
                    1201: {
                        slidesPerView: 4,
                    },
                    992: {
                        slidesPerView: 4,
                    },
                    768: {
                        slidesPerView: 3,
                    },
                    575: {
                        slidesPerView: 3,
                    },
                    320: {
                        slidesPerView: 1,
                    },
				}}
			>	
               
				{dataBlog.map((d,i)=>(
					<SwiperSlide key={i}>						
                       <div class="card">
                            <div class="card-body">
                                <div class="new-arrival-product">
                                    <div class="new-arrivals-img-contnent rounded">
                                        <img class="img-fluid" src={d.image} alt="" />
                                    </div>
                                    <div class="new-arrival-content text-center mt-3">
                                        <h4><a href="ecom-product-detail.html" class="text-black">Bonorum et Malorum</a></h4>
                                        <ul class="star-rating">
                                            <li><i class="fa fa-star"></i></li>
                                            <li><i class="fa fa-star"></i></li>
                                            <li><i class="fa fa-star"></i></li>
                                            <li><i class="fas fa-star-half-alt"></i></li>
                                            <li><i class="fas fa-star-half-alt"></i></li>
                                        </ul>
                                        <span class="price">${d.price}.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>			
					</SwiperSlide>
				))}			
                
			</Swiper>
        </>
    );
};


export default SimilarSlider;
