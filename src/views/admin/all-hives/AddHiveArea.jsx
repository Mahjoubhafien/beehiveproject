import React, { useState } from "react";
import TextField from "components/fields/TextField.jsx";
import { ThemeProvider, Select, Option } from "@material-tailwind/react";


function AddHiveArea(props)
{
    return (
    <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-4 mb-5">
      <TextField
        label="Hive Name"
        placeholder=""
        id="textarea"
        cols="10"
        rows="2"
      />
    <TextField
        label="Hive Location"
        placeholder=""
        id="textarea"
        cols="10"
        rows="2"
      />
       <ThemeProvider>
      <div className="w-72">
        <Select label="Select Version">
          <Option>Horizon UI HTML</Option>
          <Option>Horizon UI React</Option>
          <Option>Horizon UI Vue</Option>
          <Option>Horizon UI Angular</Option>
          <Option>Horizon UI Svelte</Option>
        </Select>
      </div>
    </ThemeProvider>
    </div>
  );
}
export default AddHiveArea;