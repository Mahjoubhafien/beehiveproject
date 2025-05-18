import React, { useEffect, useState } from "react";
import hiveData from "./variables/hiveData.js";
import HiveCard from "./components/HiveCard.jsx";
import AddHiveArea from "./AddHiveArea.jsx";
import BEE1 from "assets/img/beehive/bee1.png";
import AddHiveButton from "./components/AddHiveButton.jsx";
import Alert from "@mui/material/Alert";

const AllHives = () => {
  const [listOfHives, setlistOfHives] = useState([]);
  const [isSlideclicked, setSladeState] = useState(false);
  const [isHiveAdded, setisHiveAdded] = useState(false);
  const [hiveAlreadyEx, setHiveAlreadyEx] = useState(false);
  /*useEffect(() => {
    fetch("http://localhost:5000/admin/all-hives")
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend says:", data);
      })
      .catch((err) => console.error("Error fetching hives:", err));
  }, []);*/
  /////////////////// UseEffect /////////////////////////
  useEffect(() => {
    if (isHiveAdded) {
      const timer = setTimeout(() => {
        setisHiveAdded(false); // Hide the alert after 3 seconds
      }, 2000);

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [isHiveAdded]); // Run effect when `isHiveAdded` changes
useEffect(() => {
    if (hiveAlreadyEx) {
      const timer = setTimeout(() => {
        setHiveAlreadyEx(false); // Hide the alert after 3 seconds
      }, 2000);

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [hiveAlreadyEx]); // Run effect when `isHiveAdded` changes
  /////////////////// UseEffect /////////////////////////
  function sliderHandler() {
    setSladeState(!isSlideclicked);
  }
  async function AddHiveHandler(newHive) {
try {
    const response = await fetch("http://localhost:5000/admin/add-hive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newHive),
    });

    if (!response.ok) {
      setHiveAlreadyEx(!hiveAlreadyEx);
      throw new Error("Failed to add hive");
    }

    const result = await response.json();
    console.log("Hive added successfully:", result);
    setisHiveAdded(true); // Show success alert
     } catch (error) {
    console.error("Error adding hive:", error);
    // You might want to show an error alert here
  }
  }

  return (
    <div>
      <AddHiveButton sliderHandler={sliderHandler} />
      {isSlideclicked ? <AddHiveArea AddHive={AddHiveHandler} /> : null}
      {isHiveAdded ? (
        <Alert variant="filled" severity="success">
          Hive Added Succesfuly.
        </Alert>
      ) : null}
      {hiveAlreadyEx ? (
        <Alert variant="filled" severity="warning">
          Hive Already Existe.
        </Alert>
      ) : null}
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
