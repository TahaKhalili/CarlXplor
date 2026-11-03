import { Camera, GeoJSONSource, Layer, Map } from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";


const CAMPUS_BOX: [number, number, number, number] = [-93.162, 44.455, -93.143, 44.468];
const fog = turf.bboxPolygon(CAMPUS_BOX);


export default function CampusMap() {
  return (
    <Map style={{ flex: 1 }} mapStyle="https://tiles.openfreemap.org/styles/liberty">
      <Camera
        initialViewState={{ center: [-93.1534, 44.4613], zoom: 10 }}
        maxBounds={[-93.158634, 44.460488, -93.146167, 44.466659]}
        minZoom={16}
      />
      <GeoJSONSource id="fog" data={fog}>
        <Layer
          id="fog-fill"
          type="fill"
          source="fog"
          paint={{ "fill-color": "#DCE1EA", "fill-opacity": 0.8 }}
        />
      </GeoJSONSource>
    </Map>
  );
}