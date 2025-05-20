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
        <Item style={{backgroundColor:"#1976d2", color:"white"}} >Total Hive <span style={{fontWeight: "bold"}}>{props.totalHive}</span></Item>
        <Item style={{backgroundColor:"#2e7d32", color:"white"}} >Healthy Hive <span style={{fontWeight: "bold"}}>{props.healthyHives}</span></Item>
        <Item style={{backgroundColor:"#d32f2f", color:"white"}} >Unhealthy Hive <span style={{fontWeight: "bold"}}>{props.unhealthyHives}</span> </Item>
        <Item style={{backgroundColor:"#616161", color:"white"}} >No Data hive <span style={{fontWeight: "bold"}}>{props.noDataHives}</span></Item>
      </Stack>
    </div>
  );
}
export default HivesSummary;