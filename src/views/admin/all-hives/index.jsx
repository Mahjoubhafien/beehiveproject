import React, { useEffect } from "react";
import hiveData from "./variables/hiveData.js";
import HiveCard from "./components/HiveCard.jsx";
import AddHiveArea from "./AddHiveArea.jsx";
import BEE1 from "assets/img/beehive/bee1.png";
import AddHiveButton from "./components/AddHiveButton.jsx";

const AllHives = () => {

    useEffect(() => {
    fetch("http://localhost:5000/admin/all-hives")
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend says:", data);
      })
      .catch((err) => console.error("Error fetching hives:", err));
  }, []);
  function onAdd()
  {
    console.log("add button clicked");
  }

  return (
    <div>
    <AddHiveButton AddBeehiveHandler={onAdd}/>
    <AddHiveArea />
    <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-4">
   {hiveData.map((hive, index) => (
    <HiveCard key={index} id={hive.id} hiveName={hive.hiveName} image={BEE1} Temperature={hive.temperature} Humidity={hive.humidity} Location={hive.location} lastDataR={hive.lastDataTime} link="default" />
   ))}
    </div>
    </div>
  );
};

export default AllHives;
