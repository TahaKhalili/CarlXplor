// src/location.ts
// Gets the phone's location with expo-location (it uses Apple's Core Location on iOS)
// and turns each reading into a row shaped like the raw_points table.

import * as Location from 'expo-location';
import { AppState } from 'react-native';

// change this on each test phone (tester initials)
const DEVICE_ID = 't01';

// 'inside' or 'outside', set from a button later
let currentNote: string | null = null;

// every reading so far (later we send these to the server)
const points: any[] = [];

let subscription: Location.LocationSubscription | null = null;

export function setNote(note: string | null) {
  currentNote = note;
}

export function getPoints() {
  return points;
}

export async function startLocation() {
  if (subscription) return;  // already running

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Location permission was denied');
    return;
  }

  subscription = await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 0 },
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
        battery: null,  // not collected yet
        note: currentNote,
      };
      points.push(point);
      console.log(point);
    }
  );
}

export function stopLocation() {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
}
