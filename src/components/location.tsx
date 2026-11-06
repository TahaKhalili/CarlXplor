import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { mapStyles } from "../components/mapStyles";

export default function LocationButton() {
  return (
    <Pressable style={mapStyles.locationButton}>
      <MaterialIcons
        name="near-me"
        style={mapStyles.locationIcon}
      />
    </Pressable>
  );
}