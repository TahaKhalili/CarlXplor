import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import LeaderboardSheet from "./leaderboard-sheet";
import { mapStyles } from "./mapStyles";
import { PressScale } from "./press-scale";

export default function CrownButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PressScale
        style={mapStyles.crownButton}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open leaderboard"
      >
        <MaterialCommunityIcons
          name="crown"
          style={mapStyles.crownIcon}
        />
      </PressScale>

      <LeaderboardSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}