import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './FunActivitiesResults.css';
import Navbar from '../components/Navbar';

export default function FunActivitiesResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Define the available categories with value and label.
  const categories = [
    { value: 'outdoor', label: 'Outdoor Activities' },
    { value: 'indoor', label: 'Indoor Activities' },
    { value: 'restaurants', label: 'Restaurants' },
    { value: 'entertainment', label: 'Entertainment' },
  ];

  // Mapping of category values to query strings.
  const categoryQueries = {
    outdoor: "outdoor activities",
    indoor: "indoor activities",
    restaurants: "restaurants",
    entertainment: "entertainment",
  };

  // Helper to get label for a category value.
  const getCategoryLabel = (catValue) => {
    const found = categories.find(cat => cat.value === catValue);
    return found ? found.label : 'Fun Activities';
  };

  const [currentLabel, setCurrentLabel] = useState(getCategoryLabel(initialCategory));

  // Update the header label and URL query when category changes.
  useEffect(() => {
    setCurrentLabel(getCategoryLabel(category));
    setSearchParams({ category });
  }, [category, setSearchParams]);

  // Load Google Maps script using API key from environment (or fallback)
  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
      } else {
        if (document.getElementById('google-maps')) {
          const interval = setInterval(() => {
            if (window.google && window.google.maps) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
          return;
        }
        const script = document.createElement('script');
        script.id = 'google-maps';
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyDzIZR4ltekwSES6BZbH1ethG3dAPeZyFA';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject("Google Maps script failed to load");
        document.body.appendChild(script);
      }
    });
  };

  // Get user's current location.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.error(err);
          setLocation({ lat: 39.8283, lng: -98.5795 });
        }
      );
    } else {
      setLocation({ lat: 39.8283, lng: -98.5795 });
    }
  }, []);

  // Initialize the map when location is available.
  useEffect(() => {
    if (location) {
      loadGoogleMapsScript()
        .then(() => {
          if (mapRef.current) {
            const initMap = new window.google.maps.Map(mapRef.current, {
              center: location,
              zoom: 14,
            });
            setMap(initMap);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [location]);

  // When the category or location changes, perform a Places search.
  useEffect(() => {
    if (!location || !category || !window.google || !map) return;
    setLoading(true);
    // Clear previous markers.
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: 5000,
      query: categoryQueries[category] || category,
    };

    service.textSearch(request, (results, status) => {
      setLoading(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const filtered = results.filter(place => {
          const name = place.name.toLowerCase();
          return !(name.includes('pub') || name.includes('bar') || name.includes('liquor'));
        });
        setPlaces(filtered);

        const newMarkers = filtered.map(place => {
          if (place.geometry && place.geometry.location) {
            return new window.google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: place.name,
            });
          }
          return null;
        }).filter(marker => marker !== null);
        setMarkers(newMarkers);

        if (filtered.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          filtered.forEach(place => {
            if (place.geometry && place.geometry.location) {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        }
      } else {
        setPlaces([]);
      }
    });
  }, [category, location, map]);

  return (
    <div className="fun-activities-results-container">
      <Navbar onSignOut={() => {
        localStorage.removeItem('bacshotsUser');
        window.location.href = '/signin';
      }} />
      <div className="fun-activities-results-content">
        <div className="results-header">
          <h2>{currentLabel}</h2>
          <div className="category-selector-manual">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="" disabled>Select a category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="results-layout">
          <div className="results-list">
            <div className="results-items">
              {loading ? (
                <p>Searching for activities...</p>
              ) : (
                places.length === 0 ? (
                  <p>No activities found. Try a different category.</p>
                ) : (
                  places.map(place => (
                    <div key={place.place_id} className="place-item">
                      <h3>{place.name}</h3>
                      <p>{place.formatted_address || place.vicinity}</p>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
          <div className="results-map">
            <div className="map-container" ref={mapRef}>
              {!location && <p>Loading map...</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
