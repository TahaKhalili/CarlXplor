import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { mapStyles } from "../components/mapStyles";

export default function PlusButton() {
  return (
    <Pressable style={mapStyles.plusButton}>
      <MaterialIcons
        name="add-circle"
        style={mapStyles.plusIcon}
      />
    </Pressable>
  );
}
