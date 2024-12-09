"use client";

import dynamic from "next/dynamic";

// Dynamically import MapContainer to avoid hydration issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {
  ssr: false,
});

import "leaflet/dist/leaflet.css";
import { TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Configure Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ParkingMap = ({ data = [] }) => {
  return (
    <MapContainer
      center={[51.505, -0.09]} // Adjust the center coordinates
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {data.map((spot, index) => (
        <Marker
          key={index}
          position={[spot.location.coordinates[1], spot.location.coordinates[0]]}
        >
          <Popup>
            <strong>{spot.nome}</strong>
            <br />
            {spot.indirizzo || "No address available"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ParkingMap;
