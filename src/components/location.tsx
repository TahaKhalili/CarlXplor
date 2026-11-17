import { MaterialIcons } from "@expo/vector-icons";
import { PressScale } from "../components/press-scale";
import { mapStyles } from "../components/mapStyles";

type LocationButtonProps = {
  active: boolean;
  onPress: () => void;
};

export default function LocationButton({ active, onPress }: LocationButtonProps) {
  return (
    <PressScale
      style={mapStyles.locationButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Recenter map on my location"
    >
      <MaterialIcons
        name="near-me"
        style={[mapStyles.locationIcon, { color: active ? "#6AA5E0" : "white" }]}
      />
    </PressScale>
  );
}
