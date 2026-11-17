import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import LeaderboardSheet from "./leaderboard-sheet";
import { mapStyles } from "./mapStyles";
import { PressScale } from "./press-scale";

type CrownButtonProps = {
  percent?: number; // your live percent explored
};

export default function CrownButton({ percent }: CrownButtonProps) {
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

      <LeaderboardSheet visible={open} onClose={() => setOpen(false)} percent={percent} />
    </>
  );
}