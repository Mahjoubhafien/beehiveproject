import React, { useState } from "react";
import TextField from "components/fields/TextField.jsx";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from '@mui/icons-material/Upload';

function AddHiveArea(props) {
  const [newHive, setNewHive] = useState({
    hiveName: "",
    hiveLocation: "",
    sensorId: "",
    photoUrl:null,
  });

  function textHandler(e) {
    const { id, value } = e.target;
    setNewHive((lastValue) => {
      return {
        ...lastValue,
        [id]: value,
      };
    });
  }
const UploadPhotoHandler = async (e) => {
  console.log("uplod photo trigered");
};

  return (
    <div className="z-20 mb-5 grid grid-cols-1 gap-5 md:grid-cols-4">
      <TextField
        onChange={textHandler}
        label="Hive Name"
        placeholder="What is you hive name ?"
        id="hiveName"
        cols="10"
        rows="2"
        type="text"
        value={newHive.hiveName}
      />
      <TextField
        onChange={textHandler}
        label="Hive Location"
        placeholder="Where is you hive located ?"
        id="hiveLocation"
        cols="10"
        rows="2"
        type="text"
        value={newHive.hiveLocation}
      />
      <TextField
        onChange={textHandler}
        label="Sensor ID"
        placeholder="must be unique !"
        id="sensorId"
        cols="5"
        rows="2"
        type="number"
        value={newHive.sensorId}
      />
  
      <div className="mt-6 flex items-center justify-start">
       <label className="mr-5 cursor-pointer rounded-xl bg-gradient-to-br from-brandLinear to-blueSecondary px-5 py-3 text-base font-medium text-white transition duration-200 hover:shadow-lg hover:shadow-blueSecondary/50">
    <input 
      type="file" 
      accept="image/*" 
      onChange={UploadPhotoHandler}
      className="hidden"
    />
    <UploadIcon /> Upload Hive Photo
  </label>
        <button
          onClick={() => {
            props.AddHive(newHive);
            setNewHive({ hiveName: "", hiveLocation: "", sensorId: "" });
          }}
          className="flex items-center justify-center rounded-full bg-brand-500 p-3 text-3xl text-white transition duration-200 hover:cursor-pointer hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          <AddIcon />
        </button>
      </div>
    </div>
  );
}
export default AddHiveArea;
