import { StyleSheet } from "react-native";
export const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Button positioning
  bottomButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    zIndex: 999,
    elevation: 10,
  },
    topButton: {
    position: "absolute",
    top: 55,
    right: 20,
    zIndex: 999,
    elevation: 10,
  },

  topButtons: {
    position: "absolute",
    top: 55,
    right: 20,
    zIndex: 999,
    elevation: 10,
    gap: 15,
    alignItems: "center",
  },

  // Plus button
  plusButton: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    padding: 2,
    borderRadius: 30,
  },
  plusIcon: {
    fontSize: 50,
    color: "white",
  },

  // Profile button
  profileButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    fontSize: 38,
    color: "white",
  },

  // Location button
  locationButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  locationIcon: {
    fontSize: 28,
    color: "white",
  },

  // Crown button
  crownButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  crownIcon: {
    fontSize: 28,
    color: "white",
  },
});
