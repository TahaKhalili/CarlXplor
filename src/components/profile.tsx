import { useAuth, useUser } from "@clerk/expo";
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
  const [visible, setVisible] = useState(false);
  const { signOut } = useAuth();
  const { user } = useUser();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const close = () => setVisible(false);

  const name =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const handleLogout = async () => {
    try {
      await signOut();
      close();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Pressable onPress={() => setVisible(true)}>
        <ProfileAvatar />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={close} />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.background,
                paddingBottom: insets.bottom + Spacing.four,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.header}>
              <ProfileAvatar />
              <View style={styles.identity}>
                <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
                <Text style={[styles.email, { color: theme.textSecondary }]}>
                  {email}
                </Text>
              </View>
            </View>

            <Pressable style={styles.logout} onPress={handleLogout}>
              <Text style={styles.logoutLabel}>Log out</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    height: "70%",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    borderTopLeftRadius: Spacing.three,
    borderTopRightRadius: Spacing.three,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  identity: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  email: {
    fontSize: 14,
    marginTop: Spacing.one,
  },
  logout: {
    marginTop: Spacing.four,
    backgroundColor: "#d32f2f",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutLabel: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});
