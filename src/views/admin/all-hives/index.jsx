import React, { useEffect, useState } from "react";
import hiveData from "./variables/hiveData.js";
import HiveCard from "./components/HiveCard.jsx";
import AddHiveArea from "./AddHiveArea.jsx";
import BEE1 from "assets/img/beehive/bee1.png";
import AddHiveButton from "./components/AddHiveButton.jsx";

const AllHives = () => {
  const [listOfHives, setlistOfHives] = useState([]);
  const [isSlideclicked, setSladeState] = useState(false);
  useEffect(() => {
    fetch("http://localhost:5000/admin/all-hives")
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend says:", data);
      })
      .catch((err) => console.error("Error fetching hives:", err));
  }, []);
  function sliderHandler() {
    setSladeState(!isSlideclicked);
  }
  function AddHiveHandler(){
    console.log("i got clicked");
  }

  return (
    <div>
      <AddHiveButton sliderHandler={sliderHandler} />
      {isSlideclicked ? <AddHiveArea AddHive={AddHiveHandler}/> : null}
      <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-4">
        {hiveData.map((hive, index) => (
          <HiveCard
            key={index}
            id={hive.id}
            hiveName={hive.hiveName}
            image={BEE1}
            Temperature={hive.temperature}
            Humidity={hive.humidity}
            Location={hive.location}
            lastDataR={hive.lastDataTime}
            link="default"
          />
        ))}
      </div>
    </div>
  );
};

export default AllHives;
