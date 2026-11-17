import { CAMPUS_BOUNDS, CAMPUS_CENTER, FOG_EXTENT, OUTSIDE_CAMPUS } from "@/constants/campus";
import type { ClearedArea } from "@/utilities/explored";
import { Camera, GeoJSONSource, Layer, Map, NativeUserLocation } from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import { useMemo } from "react";

type CampusMapProps = {
  cleared: ClearedArea;
};

export default function CampusMap({ cleared }: CampusMapProps) {
  const fog = useMemo(() => {
    if (!cleared) return FOG_EXTENT;
    return turf.difference(turf.featureCollection([FOG_EXTENT, cleared])) ?? turf.featureCollection([]);
  }, [cleared]);

  return (
    <Map style={{ flex: 1 }} mapStyle="https://tiles.openfreemap.org/styles/liberty">
      <Camera
        initialViewState={{ center: CAMPUS_CENTER, zoom: 17 }}
        maxBounds={CAMPUS_BOUNDS}
        minZoom={14}
      />
      <GeoJSONSource key="outside-campus" id="outside-campus" data={OUTSIDE_CAMPUS}>
        <Layer
          id="outside-campus-fill"
          type="fill"
          source="outside-campus"
          paint={{ "fill-color": "#0E2A47", "fill-opacity": 0.6 }}
        />
      </GeoJSONSource>
      <GeoJSONSource key="fog" id="fog" data={fog}>
        <Layer
          id="fog-fill"
          type="fill"
          source="fog"
          paint={{ "fill-color": "#DCE1EA", "fill-opacity": 0.8 }}
        />
      </GeoJSONSource>
      <NativeUserLocation mode="heading" />
    </Map>
  );
}