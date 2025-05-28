import { useState, useEffect } from 'react';
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import GpsMap from "./GpsMap.jsx";
import { MdGpsFixed, MdWbSunny, MdWaterDrop, MdAir } from "react-icons/md";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles("dark", {
    backgroundColor: "#1A2027",
  }),
}));

const api_key="e21f2b6fce3340dc9ba143227252805";

function HivesSummary(props) {
   const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!props.lat || !props.lon) return;

      try {
        const query = `${props.lat},${props.lon}`;
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${api_key}&q=${query}`
        );
        const data = await response.json();
        setWeather(data.current);
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      }
    };

    fetchWeather();
  }, [props.lat, props.lon]);

  return (
    <div>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={2}
      >
        <Item style={{ backgroundColor: "#1976d2", color: "white" }}>
          Total Hives{" "}
          <span style={{ fontWeight: "bold" }}>{props.totalHive}</span>
        </Item>
        <Item style={{ backgroundColor: "#2e7d32", color: "white" }}>
          Healthy Hives{" "}
          <span style={{ fontWeight: "bold" }}>{props.healthyHives}</span>
        </Item>
        <Item style={{ backgroundColor: "#d32f2f", color: "white" }}>
          Unhealthy Hives{" "}
          <span style={{ fontWeight: "bold" }}>{props.unhealthyHives}</span>{" "}
        </Item>
        <Item style={{ backgroundColor: "#616161", color: "white" }}>
          No Data hives{" "}
          <span style={{ fontWeight: "bold" }}>{props.noDataHives}</span>
        </Item>
         {/* Weather Data Item */}
        {weather && (
          <Item style={{ backgroundColor: "#0288d1", color: "white" }}>
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <MdWbSunny /> {weather.temp_c}°C
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <MdWaterDrop /> {weather.humidity}%
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <MdAir /> {weather.wind_kph} kph
    </div>
  </div>
</Item>
        )}
      </Stack>
    </div>
  );
}
export default HivesSummary;
