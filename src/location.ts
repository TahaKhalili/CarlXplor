// src/location.ts
import * as Location from 'expo-location';
import { AppState } from 'react-native';

// macOS server's local LAN IP
const API_BASE_URL = 'http://192.168.1.45:3000'; 
const USER_ID = 'test_student_Josh';
const DEVICE_ID = 't01';

let currentNote: string | null = null;
const points: any[] = [];
let subscription: Location.LocationSubscription | null = null;

export function setNote(note: string | null) {
  currentNote = note;
}

export function getPoints() {
  return points;
}

// Helper function to send coordinates to your Express PostGIS endpoint
async function syncLocationWithBackend(
  lat: number, 
  lon: number, 
  onPolygonUpdated?: (geoJson: any) => void
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/exploration/${USER_ID}/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: lat,
        longitude: lon,
        radius: 5, // 5 meter clearing radius
      }),
    });

    if (!response.ok) {
      console.warn('Server returned status:', response.status);
      return;
    }

    const data = await response.json();
    
    // Pass the updated MultiPolygon GeoJSON back to your MapLibre screen
    if (onPolygonUpdated && data.exploredArea) {
      onPolygonUpdated(data.exploredArea);
    }
  } catch (error) {
    console.error('Failed to sync location with Express:', error);
  }
}

export async function startLocation(onPolygonUpdated?: (geoJson: any) => void) {
  if (subscription) return; // already running

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Location permission was denied');
    return;
  }

  subscription = await Location.watchPositionAsync(
    { 
      accuracy: Location.Accuracy.BestForNavigation, 
      distanceInterval: 5 // Only trigger when the student moves at least 5 meters
    },
    (loc) => {
      const point = {
        device: DEVICE_ID,
        recorded_at: new Date(loc.timestamp).toISOString(),
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
        h_acc_m: loc.coords.accuracy,
        speed_mps: loc.coords.speed,
        course_deg: loc.coords.heading,
        app_state: AppState.currentState === 'active' ? 'foreground' : 'background',
        battery: null,
        note: currentNote,
      };

      // 1. Keep saving to your local telemetry log
      points.push(point);

      // 2. Filter out wild GPS jumps (e.g., accuracy worse than 25 meters)
      if (loc.coords.accuracy && loc.coords.accuracy > 25) {
        console.log('Skipping inaccurate GPS reading:', loc.coords.accuracy, 'm');
        return;
      }

      // 3. Send valid coordinates to Express & update MapLibre
      syncLocationWithBackend(point.lat, point.lon, onPolygonUpdated);
    }
  );
}

export function stopLocation() {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
}
