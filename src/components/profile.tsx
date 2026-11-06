import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { mapStyles } from "../components/mapStyles";

export default function ProfileButton() {
  return (
    <Pressable style={mapStyles.profileButton}>
      <MaterialIcons
        name="account-circle"
        style={mapStyles.profileIcon}
      />
    </Pressable>
  );
}
