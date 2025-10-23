import { useEffect, useState } from 'react';
import { api } from '~/utils/api';
import { formatDistance, getCurrentLocation, sortByDistance } from '~/utils/geolocation';

import type { Coordinates } from "~/utils/geolocation";

interface Hospital {
  id: string;
  name: string;
  pricing: string;
  latitude?: string | null;
  longitude?: string | null;
}

interface HospitalWithDistance extends Hospital {
  distance?: number;
}

interface UseHospitalLocationReturn {
  sortedHospitals: HospitalWithDistance[];
  locationStatus: "loading" | "success" | "error";
  userLocation: Coordinates | null;
  nearestHospitalId: string;
}

export function useHospitalLocation(
  hospitals: Hospital[],
): UseHospitalLocationReturn {
  const [sortedHospitals, setSortedHospitals] =
    useState<HospitalWithDistance[]>(hospitals);
  const [locationStatus, setLocationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [nearestHospitalId, setNearestHospitalId] = useState("");

  // Get parent's home address as fallback
  const { data: parentData } = api.patient.getMyProfile.useQuery();

  useEffect(() => {
    const fetchLocationAndSort = async () => {
      setLocationStatus("loading");

      // Try to get current location first
      const currentLocation = await getCurrentLocation();

      let referenceLocation: Coordinates | null = null;

      if (currentLocation) {
        referenceLocation = currentLocation;
        setUserLocation(currentLocation);
        setLocationStatus("success");
      } else if (parentData?.latitude && parentData?.longitude) {
        // Fallback to parent's home address
        referenceLocation = {
          latitude: parseFloat(parentData.latitude),
          longitude: parseFloat(parentData.longitude),
        };
        setLocationStatus("success");
      } else {
        setLocationStatus("error");
        setSortedHospitals(hospitals);
        return;
      }

      // Sort hospitals by distance
      if (referenceLocation) {
        const sorted = sortByDistance(
          hospitals,
          referenceLocation,
          (hospital) => {
            if (hospital.latitude && hospital.longitude) {
              return {
                latitude: parseFloat(hospital.latitude),
                longitude: parseFloat(hospital.longitude),
              };
            }
            return null;
          },
        );
        setSortedHospitals(sorted);

        // Auto-select the nearest hospital
        if (sorted.length > 0 && sorted[0]?.distance !== undefined) {
          setNearestHospitalId(sorted[0]?.id || "");
        }
      }
    };

    fetchLocationAndSort();
  }, [hospitals, parentData]);

  return {
    sortedHospitals,
    locationStatus,
    userLocation,
    nearestHospitalId,
  };
}
