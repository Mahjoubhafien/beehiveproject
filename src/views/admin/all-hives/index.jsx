import React, { useEffect, useState } from "react";
import hiveData from "./variables/hiveData.js";
import HiveCard from "./components/HiveCard.jsx";
import AddHiveArea from "./AddHiveArea.jsx";
import BEE1 from "assets/img/beehive/bee1.png";
import AddHiveButton from "./components/AddHiveButton.jsx";
import Alert from "@mui/material/Alert";
import { color } from "@chakra-ui/system";

const AllHives = () => {
  const [listOfHives, setlistOfHives] = useState([]);
  const [isSlideclicked, setSladeState] = useState(false);
  const [isHiveAdded, setisHiveAdded] = useState(false);
  /*useEffect(() => {
    fetch("http://localhost:5000/admin/all-hives")
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend says:", data);
      })
      .catch((err) => console.error("Error fetching hives:", err));
  }, []);*/
  /////////////////// UseEffect /////////////////////////
  //geting all haves data from database
  
  useEffect(() => {
    const fetchHives = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/getAllHives");
      const data = await response.json();
      setlistOfHives(data);
      console.log(listOfHives);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  fetchHives();
}, []);
  useEffect(() => {
    if (isHiveAdded) {
      const timer = setTimeout(() => {
        setisHiveAdded(false); // Hide the alert after 3 seconds
      }, 2000);

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [isHiveAdded]); // Run effect when `isHiveAdded` changes
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
    //refetch hives after adding 
const fetchHives = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/getAllHives");
      const data = await response.json();
      setlistOfHives(data);
      console.log(listOfHives);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  fetchHives();
    if (!response.ok) {
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
      <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-4">
        {listOfHives.map((hive, index) => (
          <HiveCard
            key={index}
            id={hive.id}
            hiveName={hive.hiveName}
            image={BEE1}
            Temperature={hive.temperature}
            Humidity={hive.humidity}
            Location={hive.location} //
            lastDataR={hive.lastDataR}
            link="default"
          />
        ))}
      </div>
    </div>
  );
};

export default AllHives;
