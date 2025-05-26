import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import Card from "components/card";
import DeviceThermostatIcon from "@mui/icons-material/DeviceThermostat";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import GppGoodIcon from "@mui/icons-material/GppGood";
import GppBadIcon from "@mui/icons-material/GppBad";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import MapIcon from "@mui/icons-material/Map";
import { MdGpsFixed } from "react-icons/md";
import SensorsIcon from "@mui/icons-material/Sensors";
import SensorsOffIcon from "@mui/icons-material/SensorsOff";
import Tooltip from '@mui/material/Tooltip';

const HiveCard = ({
  hiveName,
  id,
  Temperature,
  Humidity,
  Location,
  Longitude,
  Latitude,
  image,
  link,
  lastDataR,
  onHealthStatusChange,
  GpsErrorHandler,
  extra,
}) => {
  const [heart, setHeart] = useState(true);
  const [healthStatus, setHealthStatus] = useState("Checking...");
  const [sensorLocation, setSensorLocation] = useState("");
  const [isRed, setIsRed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRed((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
      onHealthStatusChange("No Data");
      return "No Data";
    }

    if (
      Temperature >= MIN_TEMP &&
      Temperature <= MAX_TEMP &&
      Humidity >= MIN_HUMIDITY &&
      Humidity <= MAX_HUMIDITY
    ) {
      onHealthStatusChange("Healthy");
      return "Healthy";
    }
    onHealthStatusChange("Unhealthy");

    return "Unhealthy";
  };
  useEffect(() => {
    const sendHiveState = async () => {
      try {
        await fetch("http://localhost:5000/admin/insertState", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            healthStatus,
            id,
          }),
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    sendHiveState();
  }, [healthStatus, id]);
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Make sure sensorData has at least one entry
        const response = await fetch(
          `http://localhost:5000/admin/getHiveLocation?latitude=${Latitude}&longitude=${Longitude}`
        );
        const locationData = await response.json();
        setSensorLocation(locationData.city);
        if (
          Latitude !== null &&
          Longitude !== null &&
          locationData.city !== Location
        ) {
          GpsErrorHandler(id, hiveName);
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchLocation();
  }, [Latitude, Longitude]); // Re-run when sensorData changes

  return (
    <Card
      extra={`flex flex-col w-full h-full !p-4 3xl:p-![18px] bg-white ${extra}`}
    >
      <div className="h-full w-full">
        <div className="absolute right-0 top-0 flex items-center justify-center rounded-full bg-white">
            <div className="flex h-full w-full items-center justify-center rounded-full">
              {!(healthStatus === "No Data") ? (
                <Tooltip title="Connected" arrow>
          <SensorsIcon style={{ color: "green" }} />
        </Tooltip>
              ) : (
                <Tooltip title="Disconnected" arrow>
          <SensorsOffIcon style={{ color: "red" }} />
        </Tooltip>
              )}
            </div>
          </div>
        <div className="relative w-full">
          <div className="h-36 relative mb-1 w-full overflow-hidden rounded-xl">
            <button
              onClick={async () => {
                await fetch(
                  "http://localhost:5000/admin/detailed-dashboard/" + id
                );
                window.location.href = link;
              }}
              className="group overflow-hidden" // Added overflow-hidden to contain the scaled image
            >
              <img
                src={image}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                alt={`Hive ${hiveName}`}
              />
            </button>
          </div>
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
              <DeviceThermostatIcon /> Temperature:{" "}
              {Temperature !== null ? (
                <span>{Temperature} °C</span>
              ) : (
                <span style={{ color: "grey" }}>Waiting for data...</span>
              )}
            </p>
          </div>
          <div className="flex">
            <p className="mb-2 text-sm font-bold text-blue-500 dark:text-white">
              <WaterDropIcon /> Humidity:{" "}
              {Humidity !== null ? (
                <span>{Humidity} %</span>
              ) : (
                <span style={{ color: "grey" }}>Waiting for data...</span>
              )}
            </p>
          </div>
          <div className="text-grey-500 mb-2 flex items-center text-sm font-bold dark:text-white">
            <MapIcon className="mr-1" />
            <span>
              Location:{" "}
              {Latitude && Longitude ? sensorLocation : "Waiting For Gps..."}
            </span>
            {Latitude && Longitude && (
             <Tooltip title="Real Time Location" arrow>  <MdGpsFixed
                style={{
                  color: isRed ? "red" : "white",
                  transition: "color 0.3s ease",
                  marginLeft: "0.5rem",
                }}
              /></Tooltip>
            )}
          </div>
          <div className="flex">
            <p className="mb-2 text-sm font-bold dark:text-white">
              {healthStatus === "Healthy" ? (
                <span className="text-green-500">
                  <GppGoodIcon /> State: Healthy
                </span>
              ) : healthStatus === "Unhealthy" ? (
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
            onClick={async () => {
              await fetch(
                "http://localhost:5000/admin/detailed-dashboard/" + id
              );
              window.location.href = link;
            }}
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
