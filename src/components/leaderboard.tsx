import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { mapStyles } from "./mapStyles";

export default function CrownButton() {
  return (
    <Pressable style={mapStyles.crownButton}>
      <MaterialCommunityIcons
        name="crown"
        style={mapStyles.crownIcon}
      />
    </Pressable>
  );
}