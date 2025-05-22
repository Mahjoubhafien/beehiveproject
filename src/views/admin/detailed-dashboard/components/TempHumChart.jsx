import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import Card from "components/card";

export const dataset = [
  { x: 1, y: 2 },
  { x: 2, y: 5.5 },
  { x: 3, y: 2 },
  { x: 5, y: 8.5 },
  { x: 8, y: 1.5 },
  { x: 10, y: 5 },
];

export default function TempChart() {
  return (
    <Card extra="!p-[20px] text-center">
      <LineChart
      series={[
    { curve: "linear", data: [1, 5, 2, 6, 3, 9.3] },
    { curve: "linear", data: [6, 3, 7, 9.5, 4, 2] },
  ]}
        grid={{ vertical: true, horizontal: true }}
      />
    </Card>
  );
}
