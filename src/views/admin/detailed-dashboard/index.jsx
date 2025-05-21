import React, { useEffect, useState } from "react";
import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/admin/detailed-dashboard/components/WeeklyRevenue";
import TotalSpent from "views/admin/detailed-dashboard/components/TotalSpent";
import PieChartCard from "views/admin/detailed-dashboard/components/PieChartCard";
import { IoMdHome } from "react-icons/io";
import { FaTemperatureQuarter } from "react-icons/fa6";
import { WiHumidity } from "react-icons/wi";
import { GiWeight } from "react-icons/gi";
import { IoLocation } from "react-icons/io5";
import GppGoodIcon from "@mui/icons-material/GppGood";
import GppBadIcon from "@mui/icons-material/GppBad";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import { MdSensors } from "react-icons/md";

import { columnsDataCheck, columnsDataComplex } from "./variables/columnsData";

import Widget from "components/widget/Widget";
import CheckTable from "views/admin/detailed-dashboard/components/CheckTable";
import ComplexTable from "views/admin/detailed-dashboard/components/ComplexTable";
import DailyTraffic from "views/admin/detailed-dashboard/components/DailyTraffic";
import TaskCard from "views/admin/detailed-dashboard/components/TaskCard";
import tableDataCheck from "./variables/tableDataCheck.json";
import tableDataComplex from "./variables/tableDataComplex.json";

const Dashboard = () => {
  const [allSensorData, setAllSensorData] = useState([]);
  const [sensorLoation, setSensorLoation] = useState();
  const [stateStatus, setStateStatus] = useState("Checking...");
  const [latestSensor, setLatestSensor] = useState();


  useEffect(() => {
      const fetchCurrentSensorData = async () => {
        try {
          const response = await fetch("http://localhost:5000/admin/getCurrentSensorData");
          const sensorData = await response.json();
          const reponse = await fetch(`http://localhost:5000/admin/getHiveLocation?latitude=${sensorData[(sensorData.length)-1].latitude}&longitude=${sensorData[(sensorData.length)-1].longitude}`);
          const location = await reponse.json();
          setSensorLoation(location.city);
          setAllSensorData(sensorData);
          // Set the latest sensor value after data is fetched
        if (sensorData.length > 0) {
        setLatestSensor(sensorData[sensorData.length - 1]);}
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };
      fetchCurrentSensorData();
    }, []);
  return (
    <div>
      {/* Card widget */}

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<FaTemperatureQuarter className="h-7 w-7" />}
          title={"Temperature"}
          subtitle={latestSensor ? `${latestSensor.temperature} °C` : "Loading..."}
        />
        <Widget
          icon={<WiHumidity className="h-6 w-6" />}
          title={"Humidity"}
          subtitle={latestSensor ? `${latestSensor.humidity} %` : "Loading..."}
        />
        <Widget
          icon={<GiWeight className="h-7 w-7" />}
          title={"Weight"}
          subtitle={"Available Soon"}
        />
        <Widget
          icon={<IoLocation className="h-6 w-6" />}
          title={"Location"}
          subtitle={sensorLoation ? sensorLoation : "Loading..."}
        />
        <Widget
          icon={<GppGoodIcon className="h-7 w-7" />}
          title={"State"}
          subtitle={latestSensor ? latestSensor.hive_state : "Loading..."}
        />
        <Widget
          icon={<MdSensors className="h-6 w-6" />}
          title={"sensor Id"}
          subtitle={latestSensor ? latestSensor.sensor_id : "Loading..."}
        />
      </div>

      {/* Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <TotalSpent />
        <WeeklyRevenue />
      </div>

      {/* Tables & Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Check Table */}
        <div>
          <CheckTable
            columnsData={columnsDataCheck}
            tableData={tableDataCheck}
          />
        </div>

        {/* Traffic chart & Pie Chart */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <DailyTraffic />
          <PieChartCard />
        </div>

        {/* Complex Table , Task & Calendar */}

        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        />

        {/* Task chart & Calendar */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <TaskCard />
          <div className="grid grid-cols-1 rounded-[20px]">
            <MiniCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
