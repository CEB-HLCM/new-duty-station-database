// Form Map Picker - Wraps CoordinatePicker with MapContainer for form usage
import { MapContainer, TileLayer } from 'react-leaflet';
import { CoordinatePicker } from '../mapping/CoordinatePicker';
import type { MapCoordinates } from '../../types/dutyStation';
import 'leaflet/dist/leaflet.css';

interface FormMapPickerProps {
  onLocationSelect: (latitude: number, longitude: number) => void;
  initialCenter?: { latitude: number; longitude: number };
}

/**
 * Form Map Picker Component
 * Wraps CoordinatePicker in a MapContainer for use in forms
 */
export const FormMapPicker: React.FC<FormMapPickerProps> = ({
  onLocationSelect,
  initialCenter = { latitude: 20, longitude: 0 },
}) => {
  const handleLocationPicked = (coordinates: MapCoordinates) => {
    onLocationSelect(coordinates.latitude, coordinates.longitude);
  };

  return (
    <MapContainer
      center={[initialCenter.latitude, initialCenter.longitude]}
      zoom={3}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CoordinatePicker
        onLocationPicked={handleLocationPicked}
        initialCoordinates={initialCenter}
      />
    </MapContainer>
  );
};





