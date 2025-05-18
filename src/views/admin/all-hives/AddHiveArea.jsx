import React, { useState } from "react";
import TextField from "components/fields/TextField.jsx";
import AddIcon from "@mui/icons-material/Add";

function AddHiveArea(props) {
  const [newHive, setNewHive] = useState({
    hiveName: "",
    hiveLocation: "",
    hiveNumber: "",
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
        label="Hive Number"
        placeholder="must be unique !"
        id="hiveNumber"
        cols="5"
        rows="2"
        type="number"
        value={newHive.hiveNumber}
      />
      <div className="mt-6 flex items-center justify-start">
        <button
          onClick={() => {
            props.AddHive(newHive);
            setNewHive({ hiveName: "", hiveLocation: "", hiveNumber: "" });
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
