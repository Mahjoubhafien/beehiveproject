import React, { useEffect, useState } from "react";
import HiveCard from "./components/HiveCard.jsx";
import AddHiveArea from "./components/AddHiveArea.jsx";
import BEE1 from "assets/img/beehive/bee1.png";
import AddHiveButton from "./components/AddHiveButton.jsx";
import Alert from "@mui/material/Alert";
import HivesSummary from "./components/HivesSummary.jsx";

const AllHives = () => {
  const [listOfHives, setlistOfHives] = useState([]);
  const [isSlideclicked, setSladeState] = useState(false);
  const [isHiveAdded, setisHiveAdded] = useState(false);
  const [isSensorIdNull, setIsSensorIdNull] = useState(false);
  const [isSensorIdAlreadyExist, setIsSensorIdAlreadyExist] = useState(false);
const [healthCounts, setHealthCounts] = useState({
    healthy: 0,
    unhealthy: 0,
    noData: 0
  });
  const updateHealthCounts = (status) => {
    setHealthCounts(prev => {
      const newCounts = {...prev};
      if (status === 'Healthy') newCounts.healthy += 1;
      else if (status === 'Unhealthy') newCounts.unhealthy += 1;
      else newCounts.noData += 1;
      return newCounts;
    });
  };
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
  ///////////// notification area /////////////////
  useEffect(() => {
    if (isHiveAdded) {
      const timer = setTimeout(() => {
        setisHiveAdded(false); // Hide the alert after 3 seconds
      }, 2000);

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [isHiveAdded]); // Run effect when `isHiveAdded` changes
  useEffect(() => {
    if (isSensorIdNull) {
      const timer = setTimeout(() => {
        setIsSensorIdNull(false); // Hide the alert after 3 seconds
      }, 2000);

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [isSensorIdNull]); // Run effect when `isHiveAdded` changes
  useEffect(() => {
    if (isSensorIdAlreadyExist) {
      const timer = setTimeout(() => {
        setIsSensorIdAlreadyExist(false); // Hide the alert after 3 seconds
      }, 2000);

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [isSensorIdAlreadyExist]); // Run effect when `isHiveAdded` changes

  ///////////// END Notification area /////////////////

  function sliderHandler() {
    setSladeState(!isSlideclicked);
  }
  async function AddHiveHandler(newHive) {
    /////////// check if sensor id empty ///////////////
    if (!newHive.sensorId || newHive.sensorId.trim() === "") {
      setIsSensorIdNull(true);
      console.log("Sensor ID cannot be empty");
      return;
    }
    ////////////////////////////////////////////////////

    /////////// adding hive query ///////////////
    try {
      const response = await fetch("http://localhost:5000/admin/add-hive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHive),
      });
      ////////////////////////////////////////////////////

      /////////// check if sensor id already existe ///////////////

      const result = await response.json();

      if (!response.ok) {
        // Check if error is about existing sensor ID
        if (result.error && result.error.includes("Database error")) {
          setIsSensorIdAlreadyExist(true);
        }
        throw new Error(result.error || "Failed to add hive");
      }
      // If we get here, the hive was added successfully
      console.log("Hive added successfully:", result);
      setisHiveAdded(true); // Show success alert

      ////////////////////////////////////////////////////

      /////////// refetch hives after adding ///////////////
      const fetchHives = async () => {
        try {
          const response = await fetch(
            "http://localhost:5000/admin/getAllHives"
          );
          const data = await response.json();
          setlistOfHives(data);
          console.log(listOfHives);
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };
      await fetchHives();
    } catch (error) {
      console.error("Error adding hive:", error);
      // You might want to show an error alert here
    }
  }
  return (
    <div>
      <div className="flex items-center justify-center mt-5">
        <HivesSummary totalHive={listOfHives.length} healthyHives={healthCounts.healthy} unhealthyHives={healthCounts.unhealthy}
          noDataHives={healthCounts.noData}
          />
      </div>
      <AddHiveButton sliderHandler={sliderHandler} />
      {isSlideclicked ? <AddHiveArea AddHive={AddHiveHandler} /> : null}
      {isHiveAdded ? (
        <Alert variant="filled" severity="success">
          Hive Added Succesfuly.
        </Alert>
      ) : null}
      {isSensorIdNull ? (
        <Alert variant="filled" severity="warning">
          Sensor Id Cannot Be Empty !
        </Alert>
      ) : null}
      {isSensorIdAlreadyExist ? (
        <Alert variant="filled" severity="info">
          Sensor Id Already Exist !
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
            onHealthStatusChange={updateHealthCounts}
            link="detailed-dashboard"
          />
        ))}
      </div>
    </div>
  );
};

export default AllHives;
