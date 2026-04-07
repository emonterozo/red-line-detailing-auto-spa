export type LocationResult = {
  success: boolean;
  latitude: number | null;
  longitude: number | null;
  error?: string;
};

export const requestUserLocation = async (): Promise<LocationResult> => {
  if (!navigator.geolocation) {
    return {
      success: false,
      latitude: null,
      longitude: null,
      error: "Geolocation is not supported by your browser.",
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = "Failed to get location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "User denied location permission.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }

        resolve({
          success: false,
          latitude: null,
          longitude: null,
          error: message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
      },
    );
  });
};
