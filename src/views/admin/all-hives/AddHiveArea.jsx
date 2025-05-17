import React, { useState } from "react";
import TextField from "components/fields/TextField.jsx";
import AddIcon from '@mui/icons-material/Add';

function AddHiveArea(props) {
const [newhive, setNewHive] = useState({ title: "", location: "",number:"" });
  return (
    <div className="z-20 mb-5 grid grid-cols-1 gap-5 md:grid-cols-4">
      <TextField
        label="Hive Name"
        placeholder=""
        id="hivename"
        cols="10"
        rows="2"
      />
      <TextField
        label="Hive Location"
        placeholder=""
        id="hivelocation"
        cols="10"
        rows="2"
      />
      <TextField
        label="Hive Location"
        placeholder=""
        id="hivenumber"
        cols="5"
        rows="2"
      />
      <div className="mt-6 flex items-center justify-start">
        <button onClick={props.AddHive} className="flex items-center justify-center rounded-full bg-brand-500 p-3 text-3xl text-white transition duration-200 hover:cursor-pointer hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200">
          <AddIcon />
        </button>
      </div>
    </div>
  );
}
export default AddHiveArea;
