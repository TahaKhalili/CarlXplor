import { Camera, Map } from "@maplibre/maplibre-react-native";


export default function CampusMap() {
  return (
    <Map style={{ flex: 1 }} mapStyle="https://tiles.openfreemap.org/styles/liberty">
      <Camera
        initialViewState={{ center: [-93.1534, 44.4613], zoom: 10 }}
        maxBounds={[-93.158634, 44.460488, -93.146167, 44.466659]}
        minZoom={15}
      />
    </Map>
  );
}