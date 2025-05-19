import React, { useState } from "react";
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));


function HivesSummary(props){
      
    return (
     <div>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={2}
      >
        <Item>Total Hive</Item>
        <Item>Healthy Hive</Item>
        <Item>Unhealthy hive</Item>
        <Item>No Data hive</Item>
      </Stack>
    </div>
  );
}
export default HivesSummary;