import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons for driver and customer
const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3112/3112324.png', // delivery bike
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png', // home location
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Component to recenter map when bounds change
function MapRecenter({ driverPos, customerPos }) {
  const map = useMap();
  useEffect(() => {
    if (driverPos && customerPos) {
      const bounds = L.latLngBounds([driverPos, customerPos]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (driverPos) {
      map.setView(driverPos, 15);
    } else if (customerPos) {
      map.setView(customerPos, 15);
    }
  }, [driverPos, customerPos, map]);
  return null;
}

export default function LiveMap({ driverPos, customerPos, height = "300px" }) {
  // Default fallback center (New Delhi)
  const defaultCenter = [28.6139, 77.2090];
  const center = customerPos || driverPos || defaultCenter;

  return (
    <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0, position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {customerPos && (
          <Marker position={customerPos} icon={customerIcon}>
            <Popup>Delivery Destination</Popup>
          </Marker>
        )}

        {driverPos && (
          <Marker position={driverPos} icon={driverIcon}>
            <Popup>Rider</Popup>
          </Marker>
        )}

        {driverPos && customerPos && (
          <Polyline 
            positions={[driverPos, customerPos]} 
            color="#E63946" 
            weight={4} 
            dashArray="10, 10" 
          />
        )}
        
        <MapRecenter driverPos={driverPos} customerPos={customerPos} />
      </MapContainer>
    </div>
  );
}
