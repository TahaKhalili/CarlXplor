import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { PressScale } from "../components/press-scale";
import { mapStyles } from "../components/mapStyles";
import ProfileSheet from "./profile-sheet";

type ProfileButtonProps = {
  percent: number; // your live percent explored
};

export default function ProfileButton({ percent }: ProfileButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PressScale
        style={mapStyles.profileButton}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
      >
        <MaterialIcons
          name="account-circle"
          style={mapStyles.profileIcon}
        />
      </PressScale>

      <ProfileSheet visible={open} onClose={() => setOpen(false)} percent={percent} />
    </>
  );
}
