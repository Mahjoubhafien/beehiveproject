import React, {useState} from "react";
import {
  MdArrowDropUp,
  MdOutlineCalendarToday,
  MdBarChart,
} from "react-icons/md";
import Card from "components/card";
import {
  lineChartDataTotalSpent,
  lineChartOptionsTotalSpent,
} from "variables/charts";
import LineChart from "components/charts/LineChart";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { MdChevronRight } from 'react-icons/md';

export default function TempHumChart({ allSensorData = [] }) {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const[currentSelectedData, setCurrentSelectedData] = useState([])

  // Get last 24 valid readings
  const allReadingReadings =
    allSensorData
      ?.filter(
        (sensor) =>
          sensor.timestamp &&
          sensor.temperature !== undefined &&
          sensor.humidity !== undefined
      )
      ?.map((sensor) => ({
        time: new Date(sensor.timestamp),
        temp: sensor.temperature,
        hum: sensor.humidity,
      })) || [];
function fetchChartHandler(){
  return;
}
  return (
    <Card extra="!p-[20px] text-center">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="flex items-center gap-4 w-full">
  {/* Start Date - Takes available space */}
  <div className="flex-1 min-w-[150px]">
    <DateTimePicker
      label="Start Date"
      format="MM/DD/YYYY"
      value={startDate}
      onChange={(newValue) => setStartDate(newValue)}
      slotProps={{
        textField: {
          size: 'small',
          fullWidth: true,
        }
      }}
    />
  </div>

  {/* End Date - Takes available space */}
  <div className="flex-1 min-w-[150px]">
    <DateTimePicker
      label="End Date"
      format="MM/DD/YYYY"
      value={endDate}
      onChange={(newValue) => setEndDate(newValue)}
      slotProps={{
        textField: {
          size: 'small',
          fullWidth: true,
        }
      }}
    />
  </div>

  {/* Button - Fixed width */}
  <button className="flex items-center whitespace-nowrap rounded-xl bg-brand-500 px-4 py-3 text-base font-medium text-white hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 shrink-0"
  onClick={fetchChartHandler}>
    Fetch chart <MdChevronRight className="ml-1 text-lg" />
  </button>
</div>
      </LocalizationProvider>

      <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
        <div className="flex flex-col">
          <p className="mt-[20px] text-3xl font-bold text-navy-700 dark:text-white">
            $37.5K
          </p>
          <div className="flex flex-col items-start">
            <p className="mt-2 text-sm text-gray-600">Total Spent</p>
            <div className="flex flex-row items-center justify-center">
              <MdArrowDropUp className="font-medium text-green-500" />
              <p className="text-sm font-bold text-green-500"> +2.45% </p>
            </div>
          </div>
        </div>
        <div className="h-full w-full">
          <LineChart
            options={lineChartOptionsTotalSpent}
            series={lineChartDataTotalSpent}
          />
        </div>
      </div>
    </Card>
  );
}
