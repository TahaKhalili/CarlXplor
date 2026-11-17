import { MaterialIcons } from "@expo/vector-icons";
import { PressScale } from "../components/press-scale";
import { mapStyles } from "../components/mapStyles";

export default function ProfileButton() {
  return (
    <PressScale style={mapStyles.profileButton}>
      <MaterialIcons
        name="account-circle"
        style={mapStyles.profileIcon}
      />
    </PressScale>
  );
}
