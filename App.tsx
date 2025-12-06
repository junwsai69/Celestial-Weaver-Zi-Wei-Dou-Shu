import React, { useState, useMemo } from 'react';
import InputForm from './components/InputForm';
import Chart from './components/Chart';
import { UserInput, ChartData } from './types';
import { calculateChart } from './services/ziweiEngine';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserInput | null>(null);

  const chartData = useMemo<ChartData | null>(() => {
    if (!userData) return null;
    return calculateChart(
      userData.year,
      userData.month,
      userData.day,
      userData.hourIndex,
      userData.gender
    );
  }, [userData]);

  const handleInputSubmit = (data: UserInput) => {
    setUserData(data);
  };

  const handleReset = () => {
    setUserData(null);
  };

  return (
    <div className="min-h-screen bg-cosmic-900 text-white font-sans antialiased selection:bg-purple-500 selection:text-white">
      {!userData ? (
        <InputForm onSubmit={handleInputSubmit} />
      ) : chartData ? (
        <Chart 
          data={chartData} 
          userName={userData.name} 
          onReset={handleReset} 
        />
      ) : (
        <div className="flex h-screen items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
    </div>
  );
};

export default App;
