import React, { useEffect, useState } from 'react';
import MetalPricesCandlestickChart from './MetalPricesCandlestickChart';

const MetalPricesGoldChart = ({ data,country}) => {
  return (
    <div className="card-body">
      <MetalPricesCandlestickChart data={data} country={country} />
    </div>
  );
};

export default MetalPricesGoldChart;