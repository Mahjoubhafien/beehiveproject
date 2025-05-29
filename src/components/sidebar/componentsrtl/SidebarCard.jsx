
import {WeatherWidget} from "@daniel-szulc/react-weather-widget"
import React, { useEffect, useState } from "react";

const WeatherCard = (props) => {


  return (
    <div className="relative mt-14 flex w-[256px] justify-center rounded-[20px] bg-gradient-to-br from-[#868CFF] via-[#432CF3] to-brand-500 pb-4">
      <div className="absolute -top-12 flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-white bg-gradient-to-b from-[#868CFF] to-brand-500 dark:!border-navy-800">
         <WeatherWidget
        provider='openWeather'
        apiKey='c5ff9a87952a7b7576633c185b15ce6e'
        location='Warsaw'
        tempUnit="F"
        windSpeedUnit="mps"
        lang="pl"
    />
      </div>
    </div>
  );
};

export default WeatherCard;
