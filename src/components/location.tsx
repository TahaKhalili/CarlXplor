import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { mapStyles } from "../components/mapStyles";

type LocationButtonProps = {
  active: boolean;
  onPress: () => void;
};

export default function LocationButton({ active, onPress }: LocationButtonProps) {
  return (
    <Pressable
      style={mapStyles.locationButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Recenter map on my location"
    >
      <MaterialIcons
        name="near-me"
        style={[mapStyles.locationIcon, { color: active ? "#6AA5E0" : "white" }]}
      />
    </Pressable>
  );
}
