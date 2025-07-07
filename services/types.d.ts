// services/types.d.ts
declare module '../services/AirQualityService' {
  import { AirQualityData } from './types';
  const useAirQualityData: () => {
    airQuality: AirQualityData;
    getAqiColor: (aqi: number) => string;
  };
  export default useAirQualityData;
}