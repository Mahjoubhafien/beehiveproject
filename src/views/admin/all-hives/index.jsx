import React, { useEffect } from "react";
import hiveData from "./variables/hiveData.js";
import HiveCard from "./components/HiveCard.jsx";
import NFt2 from "assets/img/nfts/Nft2.png";
import NFt4 from "assets/img/nfts/Nft4.png";
import NFt3 from "assets/img/nfts/Nft3.png";

const AllHives = () => {

    useEffect(() => {
    fetch("http://localhost:5000/admin/all-hives")
      .then((res) => res.json())
      .then((data) => {
        console.log("Backend says:", data);
      })
      .catch((err) => console.error("Error fetching hives:", err));
  }, []);

  return (
    <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-4">
    <HiveCard
      hiveName="Test hive 1"
      id="1"
      image={NFt2}
      Temperature="27"
      Humidity="75"
      lastDataR="2025/05/2025 08:56"
      link="default"
      //extra="max-w-[250px]"
    />
    </div>
  );
};

export default AllHives;
