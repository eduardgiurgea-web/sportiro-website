import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Map as MapIcon, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom red icon for destination
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SPORTIRO_COORDS: [number, number] = [45.6706, 9.9328]; // Villongo coords

// Component to dynamically adjust map view
const MapController = ({ center, bounds }: { center: [number, number], bounds: L.LatLngBounds | null }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView(center, 13);
    }
  }, [center, bounds, map]);
  return null;
};

const GoogleMapWidget = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [routeLine, setRouteLine] = useState<[number, number][] | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=it`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error('Error fetching suggestions', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 400); // debounce 400ms
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectSuggestion = async (suggestion: any) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    setError(null);
    setLoadingRoute(true);

    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    setUserLocation([lat, lon]);

    try {
      // Calculate route via OSRM
      const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${lon},${lat};${SPORTIRO_COORDS[1]},${SPORTIRO_COORDS[0]}?overview=full&geometries=geojson`);
      const osrmData = await osrmRes.json();

      if (osrmData.code !== 'Ok' || !osrmData.routes || osrmData.routes.length === 0) {
        throw new Error('Impossibile calcolare la rotta stradale.');
      }

      const route = osrmData.routes[0];
      const distanceKm = (route.distance / 1000).toFixed(1);
      setDistance(`${distanceKm} km`);

      // GeoJSON returns coordinates in [lon, lat], Leaflet polyline needs [lat, lon]
      const geometryCoords = route.geometry.coordinates;
      const polylineCoords: [number, number][] = geometryCoords.map((c: [number, number]) => [c[1], c[0]]);
      
      setRouteLine(polylineCoords);

      // Create bounds to fit both points and the line
      const bounds = L.latLngBounds([lat, lon], SPORTIRO_COORDS);
      polylineCoords.forEach(c => bounds.extend(c));
      setMapBounds(bounds);

    } catch (err: any) {
      setError(err.message || 'Errore nel calcolo del percorso.');
      setRouteLine(null);
      setMapBounds(L.latLngBounds([lat, lon], SPORTIRO_COORDS));
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--warm-cream)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-3 md:mb-4">DOVE SIAMO</p>
          <h2 
            className="font-serif text-3xl md:text-5xl"
            style={{ color: 'var(--warm-dark)' }}
          >
            Vieni a trovarci
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Map Section */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl aspect-[4/3] lg:aspect-auto relative group z-0 z-base">
            <MapContainer 
              center={SPORTIRO_COORDS} 
              zoom={13} 
              scrollWheelZoom={false}
              className="w-full h-[400px] lg:h-full z-0"
              style={{ zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={SPORTIRO_COORDS} icon={redIcon}>
              </Marker>
              
              {userLocation && <Marker position={userLocation}></Marker>}
              
              {routeLine && (
                <Polyline 
                  positions={routeLine} 
                  color="#00b4ff" 
                  weight={4} 
                  opacity={0.8}
                  dashArray="10, 10"
                />
              )}

              <MapController center={SPORTIRO_COORDS} bounds={mapBounds} />
            </MapContainer>
            
            <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-2xl z-10" />
            
            {/* Overlay loading state */}
            {loadingRoute && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center transition-all duration-300">
                 <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3 font-medium text-[var(--sportiro-blue)]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Calcolo percorso...
                 </div>
              </div>
            )}
          </div>

          {/* Distance Calculator */}
          <div className="flex flex-col justify-center bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 z-10 relative">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-[#00b4ff]">
              <Navigation className="w-6 h-6" />
            </div>
            
            <h3 className="font-serif text-2xl mb-2" style={{ color: 'var(--warm-dark)' }}>Calcola la distanza</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Inserisci il tuo indirizzo per vedere il percorso e scoprire quanto sei distante dal nostro Sportiro Lab a Villongo.
            </p>

            <div className="space-y-4" ref={wrapperRef}>
              <div className="relative">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Il tuo indirizzo o città
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowSuggestions(true);
                      setRouteLine(null);
                      setDistance(null);
                      setUserLocation(null);
                      setMapBounds(null);
                    }}
                    onFocus={() => {
                        if (query.trim().length >= 3) setShowSuggestions(true);
                    }}
                    placeholder="Inizia a digitare..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-300"
                    style={{ focusRingColor: 'var(--sportiro-blue)' }}
                  />
                  {loadingSuggestions && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {suggestions.map((sugg, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSuggestion(sugg)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-[var(--sportiro-blue)] transition-colors border-b last:border-b-0 border-gray-50 flex items-start gap-3"
                      >
                        <MapIcon className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                        <span className="line-clamp-2">{sugg.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {showSuggestions && query.trim().length >= 3 && suggestions.length === 0 && !loadingSuggestions && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl p-4 text-sm text-gray-500 text-center">
                     Nessun risultato trovato
                  </div>
                )}
              </div>
            </div>

            {/* Results Area */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            {distance && !error && (
              <div className="mt-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100 text-center flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-400">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Distanza stradale</p>
                <div className="flex items-end justify-center gap-1 text-[#00b4ff]">
                  <span className="text-5xl font-black tracking-tight">{distance}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleMapWidget;
