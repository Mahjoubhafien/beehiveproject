import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { useState,useEffect } from "react";
import Card from "components/card";
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppBadIcon from '@mui/icons-material/GppBad';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import MapIcon from '@mui/icons-material/Map';

const HiveCard = ({hiveName, id, Temperature,Humidity,Location, image,link, lastDataR, extra}) => {
  const [heart, setHeart] = useState(true);
  const [healthStatus, setHealthStatus] = useState('Checking...');
useEffect(() => {
  // Update health status whenever temperature or humidity changes
  setHealthStatus(checkHiveHealth(Temperature, Humidity));
}, [Temperature, Humidity]);
const checkHiveHealth = (Temperature, Humidity) => {
  // Define healthy ranges (adjust these values according to beekeeping standards)
  const MIN_TEMP = 32;
  const MAX_TEMP = 36;
  const MIN_HUMIDITY = 50;
  const MAX_HUMIDITY = 70;

  if (Temperature === null || Humidity === null) {
    return 'No Data';
  }

  if (Temperature >= MIN_TEMP && Temperature <= MAX_TEMP && 
      Humidity >= MIN_HUMIDITY && Humidity <= MAX_HUMIDITY) {
    return 'Healthy';
  }
  return 'Unhealthy';
};
  return (
    <Card
      extra={`flex flex-col w-full h-full !p-4 3xl:p-![18px] bg-white ${extra}`}
    >
      <div className="h-full w-full">
        <div className="relative w-full">
          <img
            src={image}
            className="mb-3 h-full w-full rounded-xl 3xl:h-full 3xl:w-full"
            alt=""
          />
          <button
            onClick={() => setHeart(!heart)}
            className="absolute top-3 right-3 flex items-center justify-center rounded-full bg-white p-2 text-brand-500 hover:cursor-pointer"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full text-xl hover:bg-gray-50 dark:text-navy-900">
              {heart ? (
                <IoHeartOutline />
              ) : (
                <IoHeart className="text-brand-500" />
              )}
            </div>
          </button>
        </div>

        <div className="mb-3 flex items-center justify-between px-1 md:flex-col md:items-start lg:flex-row lg:justify-between xl:flex-col xl:items-start 3xl:flex-row 3xl:justify-between">
          <div className="mb-1">
            <p className="text-lg font-bold text-navy-700 dark:text-white">
              {" "}
              {hiveName}{" "}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600 md:mt-0">
              id {id}{" "}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between md:flex-col md:items-start lg:flex-row lg:justify-between xl:flex-col 2xl:items-start 3xl:flex-row 3xl:items-center 3xl:justify-between">
          <div className="flex">
            <p className="mb-2 text-sm font-bold text-red-500 dark:text-white">
              <DeviceThermostatIcon /> Temperature: {Temperature!== null ? <span>{Temperature} °C</span>: <span style={{color:"grey"}}>Waiting for data...</span> } 
            </p>
          </div>
            <div className="flex">
            <p className="mb-2 text-sm font-bold text-blue-500 dark:text-white">
             <WaterDropIcon /> Humidity: {Humidity!== null ? <span>{Humidity} °C</span>: <span style={{color:"grey"}}>Waiting for data...</span> }
            </p>
           </div>
          <div className="flex">
              <p className="mb-2 text-sm font-bold text-grey-500 dark:text-white">
             <MapIcon /> Location: {Location}
            </p>
            </div>
            <div className="flex">
            <p className="mb-2 text-sm font-bold dark:text-white">
  {healthStatus === 'Healthy' ? (
    <span className="text-green-500">
      <GppGoodIcon /> State: Healthy
    </span>
  ) : healthStatus === 'Unhealthy' ? (
    <span className="text-orange-500">
      <GppBadIcon /> State: Unhealthy
    </span>
  ) : (
    <span className="text-gray-500">
      <GppMaybeIcon /> State: No Data
    </span>
  )}
</p>
          </div>
            <p className="mb-1 text-sm font-medium text-gray-600 md:mt-2">
              Last data {lastDataR}
            </p>
          <button
            onClick={()=> window.location.href = link}
            className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90"
          >
            More Detail
          </button>
        </div>
      </div>
    </Card>
  );
};

export default HiveCard;
