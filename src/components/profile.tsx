import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { mapStyles } from "./mapStyles";

function ProfileAvatar() {
  return (
    <View style={mapStyles.profileButton}>
      <MaterialIcons name="account-circle" style={mapStyles.profileIcon} />
    </View>
  );
}

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
