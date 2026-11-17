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
