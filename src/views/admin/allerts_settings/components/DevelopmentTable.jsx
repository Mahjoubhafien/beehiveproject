import React, { useEffect, useState } from "react";
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import { FaSms } from "react-icons/fa";

function SmsAlertsTable(props) {
// Initialize state from localStorage or use default
  const [smsEnabled, setSmsEnabled] = useState(() => {
    const saved = localStorage.getItem('smsEnabled');
    return saved === 'true' ? true : false;
  });  
  // State for threshold values
  const [tempMin, setTempMin] = useState(32);
  const [tempMax, setTempMax] = useState(36);
  const [humidityMin, setHumidityMin] = useState(50);
  const [humidityMax, setHumidityMax] = useState(70);
  const [weightMin, setWeightMin] = useState(10);
  const [weightMax, setWeightMax] = useState(100);

  // Save states to localStorage when they change
  useEffect(() => {
    localStorage.setItem('smsEnabled', smsEnabled);
  }, [smsEnabled]);

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/alert-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          MIN_TEMP: tempMin,
          MAX_TEMP: tempMax,
          MIN_HUMIDITY: humidityMin,
          MAX_HUMIDITY: humidityMax,
          isAlertsON: smsEnabled
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save settings');
      }

      console.log("API Response:", data);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert(error.message || "Failed to save settings. Please try again.");
    }
  };

  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="relative flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-xl font-bold text-navy-700 dark:text-white">
          SMS Alerts Settings <FaSms />
        </div>        
        <CardMenu />
      </header>

      <div className="mt-8">
        {/* SMS Notification Switch */}
        <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable SMS Notification
            </span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input 
                type="checkbox" 
                className="peer sr-only" 
                checked={smsEnabled}
                onChange={() => setSmsEnabled(!smsEnabled)}
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
            </label>
          </div>
        </div>

        {/* Threshold Settings Table */}
        <div className="overflow-x-scroll xl:overflow-x-hidden">
          <table className="w-full">
            <thead>
              <tr className="!border-px !border-gray-400">
                <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                  <div className="items-center justify-between text-xs text-gray-200">
                    Parameter
                  </div>
                </th>
                <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                  <div className="items-center justify-between text-xs text-gray-200">
                    Min Threshold
                  </div>
                </th>
                <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                  <div className="items-center justify-between text-xs text-gray-200">
                    Max Threshold
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Temperature Row */}
              <tr>
                <td className="min-w-[150px] border-white/0 py-3 pr-4 font-medium">Temperature</td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <input 
                    type="number" 
                    value={tempMin}
                    onChange={(e) => setTempMin(Number(e.target.value))}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  /> °C
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <input 
                    type="number" 
                    value={tempMax}
                    onChange={(e) => setTempMax(Number(e.target.value))}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  /> °C
                </td>
              </tr>
              
              {/* Humidity Row */}
              <tr>
                <td className="min-w-[150px] border-white/0 py-3 pr-4 font-medium">Humidity</td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <input 
                    type="number" 
                    value={humidityMin}
                    onChange={(e) => setHumidityMin(Number(e.target.value))}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  /> %
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <input 
                    type="number" 
                    value={humidityMax}
                    onChange={(e) => setHumidityMax(Number(e.target.value))}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  /> %
                </td>
              </tr>
              
              {/* Weight Row */}
              <tr>
                <td className="min-w-[150px] border-white/0 py-3 pr-4 font-medium">Weight</td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <input 
                    type="number" 
                    value={weightMin}
                    onChange={(e) => setWeightMin(Number(e.target.value))}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  /> Kg
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <input 
                    type="number" 
                    value={weightMax}
                    onChange={(e) => setWeightMax(Number(e.target.value))}
                    className="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  /> Kg
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Centered Save Button */}
        <div className="mt-6 flex justify-center mb-5">
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Save Settings
          </button>
        </div>
      </div>
    </Card>
  );
}

export default SmsAlertsTable;
