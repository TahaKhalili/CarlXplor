import { MaterialIcons } from "@expo/vector-icons";
import { PressScale } from "../components/press-scale";
import { mapStyles } from "../components/mapStyles";

export default function PlusButton() {
  return (
    <PressScale style={mapStyles.plusButton}>
      <MaterialIcons
        name="add-circle"
        style={mapStyles.plusIcon}
      />
    </PressScale>
  );
}
