import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable } from "react-native";
import LeaderboardSheet from "./leaderboard-sheet";
import { mapStyles } from "./mapStyles";

export default function CrownButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        style={mapStyles.crownButton}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open leaderboard"
      >
        <MaterialCommunityIcons
          name="crown"
          style={mapStyles.crownIcon}
        />
      </Pressable>

      <LeaderboardSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}