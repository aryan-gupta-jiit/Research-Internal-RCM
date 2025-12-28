import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { categoryApi } from "../services/api";
import { Layers, Save, X, Plus, Edit } from "lucide-react";
// import { useToast } from "../hooks/use-toast";

// const extractLatLonFromUrl = (url) => {
//   if (!url) return { lat: null, lon: null };

//   try {
//     // Method 1: Extract from @lat,lon format (most common in Google Maps URLs)
//     const atSymbolMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
//     if (atSymbolMatch) {
//       return {
//         lat: parseFloat(atSymbolMatch[1]),
//         lon: parseFloat(atSymbolMatch[2])
//       };
//     }

//     return { lat: null, lon: null };
//   } catch (error) {
//     console.error('Error parsing URL:', error);
//     return { lat: null, lon: null };
//   }
// };

const extractLatLonFromUrl = (url) => {
  if (!url) return { lat: null, lon: null };

  try {
    console.log('Parsing URL for coordinates:', url);

    // Method 1: Extract from @lat,lon format (most common in Google Maps URLs)
    // This regex looks for @ followed by numbers (including decimals), comma, numbers, and optional zoom/z
    const atSymbolMatch = url.match(/@([-\d.]+),([-\d.]+)/);

    if (atSymbolMatch) {
      console.log('Coordinates found via @ pattern:', atSymbolMatch[1], atSymbolMatch[2]);
      return {
        lat: parseFloat(atSymbolMatch[1]),
        lon: parseFloat(atSymbolMatch[2])
      };
    }

    // Method 2: Try alternative patterns
    // Pattern for coordinates in !3d and !4d format (sometimes used in Google Maps)
    const dPatternMatch = url.match(/!3d([-\d.]+)!4d([-\d.]+)/);
    if (dPatternMatch) {
      console.log('Coordinates found via !3d!4d pattern:', dPatternMatch[1], dPatternMatch[2]);
      return {
        lat: parseFloat(dPatternMatch[1]),
        lon: parseFloat(dPatternMatch[2])
      };
    }

    // Method 3: Try looking for coordinates anywhere in the URL
    const coordPattern = /([-\d.]+),\s*([-\d.]+)/;
    const coordMatch = url.match(coordPattern);
    if (coordMatch) {
      console.log('General coordinates found:', coordMatch[1], coordMatch[2]);
      return {
        lat: parseFloat(coordMatch[1]),
        lon: parseFloat(coordMatch[2])
      };
    }

    console.log('No coordinates found in URL');
    return { lat: null, lon: null };
  } catch (error) {
    console.error('Error parsing URL:', error);
    return { lat: null, lon: null };
  }
};

const extractNameFromUrl = (url) => {
  if (!url) return null;

  try {
    // Extract the part between /place/ and the next / or ,
    // URL format: https://www.google.com/maps/place/The+Ramayana+Hotel,+Ayodhya/@...
    const match = url.match(/\/place\/([^/@,]+)/);
    if (match && match[1]) {
      // Replace + with spaces and decode any URL encoding
      const name = decodeURIComponent(match[1].replace(/\+/g, ' '));
      return name;
    }

    return null;
  } catch (error) {
    console.error('Error extracting name from URL:', error);
    return null;
  }
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  city,
  editData,
  onSuccess,
}) {
  //   const { toast } = useToast();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (open) {
      if (editData) {
        // For edit mode, populate all fields including individual image fields
        const editFormData = { ...editData };

        // Extract individual image fields from the images array
        if (editData.images && Array.isArray(editData.images)) {
          editFormData.image0 = editData.images[0] || '';
          editFormData.image1 = editData.images[1] || '';
          editFormData.image2 = editData.images[2] || '';
        } else {
          // Fallback if images array doesn't exist
          editFormData.image0 = editData.image0 || '';
          editFormData.image1 = editData.image1 || '';
          editFormData.image2 = editData.image2 || '';
        }

        setFormData(editFormData);
      } else {
        // For create mode
        setFormData({
          cityId: city.cityId,
          cityName: city.cityName,
          image0: '',
          image1: '',
          image2: '',
          images: []
        });
      }
    }
  }, [open, editData, city]);



  // Function to handle location link changes and auto-fill lat/lon
  // const handleLocationLinkChange = (value) => {
  //   // updateFormData('locationLink', value);
  //   setFormData(prev=>({'locationLink': value}));

  //   // Extract coordinates from the URL
  //   const { lat, lon } = extractLatLonFromUrl(value);

  //   console.log('Extracted coordinates:', { lat, lon }); // Debug log

  //   if (lat !== null && lon !== null) {
  //     // Update lat and lon fields if they exist in the form
  //     setFormData(prev => ({
  //       ...prev,
  //       lat: lat,
  //       lon: lon
  //     }));
  //   }
  // };

  //   const handleLocationLinkChange = (value) => {
  //   // First update the locationLink field while preserving other fields
  //   setFormData(prev => ({ ...prev, locationLink: value }));

  //   // Extract coordinates from the URL
  //   const { lat, lon } = extractLatLonFromUrl(value);

  //   console.log('Extracted coordinates:', { lat, lon }); // Debug log

  //   if (lat !== null && lon !== null) {
  //     // Update lat and lon fields while preserving all other fields
  //     setFormData(prev => ({
  //       ...prev, // This preserves all existing fields
  //       lat: lat,
  //       lon: lon
  //     }));
  //   }
  // };

  // const handleLocationLinkChange = (value, fieldKey) => {
  //   // First update the locationLink field while preserving other fields
  //   setFormData(prev => ({ ...prev, [fieldKey]: value }));

  //   // Extract coordinates from the URL
  //   const { lat, lon } = extractLatLonFromUrl(value);

  //   console.log('Extracted coordinates:', { lat, lon, fieldKey }); // Debug log

  //   if (lat !== null && lon !== null) {
  //     // For Miscellaneous category, map location links to their corresponding lat/lon fields
  //     let latField, lonField;

  //     switch (fieldKey) {
  //       case 'hospitalLocationLink':
  //         latField = 'hospitalLat';
  //         lonField = 'hospitalLon';
  //         break;
  //       case 'PoliceLocationLink':
  //         latField = 'PoliceLat';
  //         lonField = 'PoliceLon';
  //         break;
  //       case 'parkingLocationLink':
  //         latField = 'parkingLat';
  //         lonField = 'parkingLon';
  //         break;
  //       case 'publicWashroomsLocationLink':
  //         latField = 'publicWashroomsLat';
  //         lonField = 'publicWashroomsLon';
  //         break;
  //       default:
  //         // For other categories, use generic lat/lon fields
  //         latField = 'lat';
  //         lonField = 'lon';
  //     }

  //     // Update lat and lon fields while preserving all other fields
  //     setFormData(prev => ({
  //       ...prev, // This preserves all existing fields
  //       [latField]: lat,
  //       [lonField]: lon
  //     }));
  //   }
  // };

  const handleLocationLinkChange = (value, fieldKey) => {
    // First update the locationLink field while preserving other fields
    setFormData(prev => ({ ...prev, [fieldKey]: value }));

    // Extract coordinates from the URL
    const { lat, lon } = extractLatLonFromUrl(value);

    // Extract name from the URL
    const name = extractNameFromUrl(value);

    console.log('Extracted data:', { lat, lon, name, fieldKey }); // Debug log

    const updates = {};

    if (lat !== null && lon !== null) {
      // For Miscellaneous category, map location links to their corresponding lat/lon fields
      let latField, lonField;

      switch (fieldKey) {
        case 'hospitalLocationLink':
          latField = 'hospitalLat';
          lonField = 'hospitalLon';
          break;
        case 'PoliceLocationLink':
          latField = 'PoliceLat';
          lonField = 'PoliceLon';
          break;
        case 'parkingLocationLink':
          latField = 'parkingLat';
          lonField = 'parkingLon';
          break;
        case 'publicWashroomsLocationLink':
          latField = 'publicWashroomsLat';
          lonField = 'publicWashroomsLon';
          break;
        default:
          // For other categories, use generic lat/lon fields
          latField = 'lat';
          lonField = 'lon';
      }

      updates[latField] = lat;
      updates[lonField] = lon;
    }

    // Extract and store name based on category and field
    if (name !== null) {
      switch (category) {
        case 'Accommodation':
          if (fieldKey === 'locationLink') {
            updates['hotels'] = name;
          }
          break;
        case 'Food':
          if (fieldKey === 'locationLink') {
            updates['foodPlace'] = name;
          }
          break;
        case 'HiddenGems':
          if (fieldKey === 'locationLink') {
            updates['hiddenGem'] = name;
          }
          break;
        case 'NearbyTouristSpots':
        case 'PlacesToVisit':
          if (fieldKey === 'locationLink') {
            updates['places'] = name;
          }
          break;
        case 'Shopping':
          if (fieldKey === 'locationLink') {
            updates['shops'] = name;
          }
          break;
        case 'Miscellaneous':
          switch (fieldKey) {
            case 'hospitalLocationLink':
              updates['hospital'] = name;
              break;
            case 'PoliceLocationLink':
              updates['Police'] = name || 'Police Station';
              break;
            case 'parkingLocationLink':
              updates['parking'] = name;
              break;
            case 'publicWashroomsLocationLink':
              updates['publicWashrooms'] = name;
              break;
          }
          break;
        default:
          // For other categories, store in generic name field if it exists
          if (fieldKey === 'locationLink' && fields.some(f => f.key === 'name')) {
            updates['name'] = name;
          }
      }
    }

    // Apply all updates at once
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...updates
      }));
    }
  };

  const getFormFields = () => {
    switch (category) {
      case 'Accommodation':
        return [
          { key: 'hotels', label: 'Hotel Name', type: 'text', required: true },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'lat', label: 'Latitude', type: 'number' },
          { key: 'lon', label: 'Longitude', type: 'number' },
          { key: 'locationLink', label: 'Location Link', type: 'text' },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'minPrice', label: 'Min Price', type: 'text' },
          { key: 'maxPrice', label: 'Max Price', type: 'text' },
          { key: 'roomTypes', label: 'Room Types (comma-separated)', type: 'string' },
          { key: 'facilities', label: 'Facilities (comma-separated)', type: 'string' },
          { key: 'image0', label: 'Image 1 URL', type: 'text' },
          { key: 'image1', label: 'Image 2 URL', type: 'text' },
          { key: 'image2', label: 'Image 3 URL', type: 'text' },
          { key: 'flagShip', label: 'Flagship Property', type: 'checkbox' },
          // { key: 'premium', label: 'Premium', type: 'checkbox' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];
      case 'GeneralCityInfo':
        return [
          { key: 'stateOrUT', label: 'State/UT', type: 'text' },
          { key: 'alternateNames', label: 'Alternate Names (comma-separated)', type: 'array' },
          { key: 'languagesSpoken', label: 'Languages Spoken (comma-separated)', type: 'array' },
          { key: 'climateInfo', label: 'Climate Information', type: 'textarea' },
          { key: 'bestTimeToVisit', label: 'Best Time to Visit', type: 'text' },
          { key: 'cityHistory', label: 'City History', type: 'textarea' },
          { key: 'coverImage', label: 'Cover Image URL', type: 'text' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];
      case 'Activities':
        return [
          { key: 'topActivities', label: 'Top Activities', type: 'text', required: true },
          { key: 'bestPlaces', label: 'Best Places to Visit', type: 'text' },
          { key: 'description', label: 'Activity Description', type: 'textarea' },
          { key: 'essentials', label: 'Travel Essentials', type: 'text' },
          { key: 'fee', label: 'Entry Fee/Cost', type: 'text' },
          { key: 'image0', label: 'Image URL', type: 'text' },
          { key: 'videos', label: 'Video URLs', type: 'array' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];
      case 'Connectivity':
        return [
          { key: 'nearestAirportStationBusStand', label: 'Nearest Airport/Station/Bus Stand', type: 'text', required: true },
          { key: 'distance', label: 'Distance from City', type: 'text' },
          { key: 'lat', label: 'Latitude', type: 'number' },
          { key: 'lon', label: 'Longitude', type: 'number' },
          { key: 'locationLink', label: 'Location Link', type: 'text' },
          { key: 'majorFlightsTrainsBuses', label: 'Major Flights/Trains/Buses', type: 'textarea' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];
      case 'Food':
        return [
          { key: 'foodPlace', label: 'Food Place Name', type: 'text', required: true },
          { key: 'flagship', label: 'Flagship Place', type: 'checkbox' },
          { key: 'lat', label: 'Latitude', type: 'number' },
          { key: 'lon', label: 'Longitude', type: 'number' },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'locationLink', label: 'Location Link', type: 'text' },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'vegOrNonVeg', label: 'Veg/Non-Veg', type: 'select', options: ['Veg', 'NonVeg', 'Both'] },
          { key: 'valueForMoney', label: 'Value for Money (0-5)', type: 'number' },
          { key: 'service', label: 'Service Rating (0-5)', type: 'number' },
          { key: 'taste', label: 'Taste Rating (0-5)', type: 'number' },
          { key: 'hygiene', label: 'Hygiene Rating (0-5)', type: 'number' },
          { key: 'menuSpecial', label: 'Menu Specialties', type: 'textarea' },
          { key: 'menuLink', label: 'Menu Link', type: 'text' },
          { key: 'openDay', label: 'Open Days', type: 'text' },
          { key: 'openTime', label: 'Open Time', type: 'text' },
          { key: 'phone', label: 'Phone Number', type: 'text' },
          { key: 'website', label: 'Website', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'image0', label: 'Image 1 URL', type: 'text' },
          { key: 'image1', label: 'Image 2 URL', type: 'text' },
          { key: 'image2', label: 'Image 3 URL', type: 'text' },
          { key: 'videos', label: 'Video URLs', type: 'array' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];

      case 'HiddenGems':
        return [
          { key: 'hiddenGem', label: 'Hidden Gem Name', type: 'text', required: true },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'lat', label: 'Latitude', type: 'number' },
          { key: 'lon', label: 'Longitude', type: 'number' },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'locationLink', label: 'Location Link', type: 'text' },
          { key: 'openDay', label: 'Open Days', type: 'text' },
          { key: 'openTime', label: 'Open Time', type: 'text' },
          { key: 'establishYear', label: 'Establish Year', type: 'text' },
          { key: 'fee', label: 'Entry Fee', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'essential', label: 'Essentials', type: 'text' },
          { key: 'story', label: 'Story', type: 'textarea' },
          { key: 'image0', label: 'Image 1 URL', type: 'text' },
          { key: 'image1', label: 'Image 2 URL', type: 'text' },
          { key: 'image2', label: 'Image 3 URL', type: 'text' },
          { key: 'videos', label: 'Video URLs', type: 'array' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];

      case 'LocalTransport':
        return [
          { key: 'from', label: 'From', type: 'text', required: true },
          { key: 'to', label: 'To', type: 'text', required: true },
          { key: 'autoPrice', label: 'Auto Price', type: 'text' },
          { key: 'cabPrice', label: 'Cab Price', type: 'text' },
          { key: 'bikePrice', label: 'Bike Price', type: 'text' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];

      case 'NearbyTouristSpots':
        return [
          { key: 'places', label: 'Place Name', type: 'text', required: true },
          { key: 'distance', label: 'Distance', type: 'text' },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'lat', label: 'Latitude', type: 'number' },
          { key: 'lon', label: 'Longitude', type: 'number' },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'locationLink', label: 'Location Link', type: 'text' },
          { key: 'openDay', label: 'Open Days', type: 'text' },
          { key: 'openTime', label: 'Open Time', type: 'text' },
          { key: 'establishYear', label: 'Establish Year', type: 'text' },
          { key: 'fee', label: 'Entry Fee', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'essential', label: 'Essentials', type: 'text' },
          { key: 'story', label: 'Story', type: 'textarea' },
          { key: 'image0', label: 'Image 1 URL', type: 'text' },
          { key: 'image1', label: 'Image 2 URL', type: 'text' },
          { key: 'image2', label: 'Image 3 URL', type: 'text' },
          { key: 'videos', label: 'Video URLs', type: 'array' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];

      case 'PlacesToVisit':
        return [
          { key: 'places', label: 'Place Name', type: 'text', required: true },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'lat', label: 'Latitude', type: 'number' },
          { key: 'lon', label: 'Longitude', type: 'number' },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'locationLink', label: 'Location Link', type: 'text' },
          { key: 'openDay', label: 'Open Days', type: 'text' },
          { key: 'openTime', label: 'Open Time', type: 'text' },
          { key: 'establishYear', label: 'Establish Year', type: 'text' },
          { key: 'fee', label: 'Entry Fee', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'essential', label: 'Essentials', type: 'text' },
          { key: 'story', label: 'Story', type: 'textarea' },
          { key: 'image0', label: 'Image 1 URL', type: 'text' },
          { key: 'image1', label: 'Image 2 URL', type: 'text' },
          { key: 'image2', label: 'Image 3 URL', type: 'text' },
          { key: 'videos', label: 'Video URLs', type: 'array' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];

      case 'Shopping':
        return [
          { key: 'shops', label: 'Shop Name', type: 'text', required: true },
          { key: 'flagship', label: 'Flagship Shop', type: 'checkbox' },
          { key: 'lat', label: 'Latitude', type: 'number' },
          { key: 'lon', label: 'Longitude', type: 'number' },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'locationLink', label: 'Location Link', type: 'text' },
          { key: 'famousFor', label: 'Famous For', type: 'text' },
          { key: 'priceRange', label: 'Price Range', type: 'text' },
          { key: 'openDay', label: 'Open Days', type: 'text' },
          { key: 'openTime', label: 'Open Time', type: 'text' },
          { key: 'phone', label: 'Phone', type: 'text' },
          { key: 'website', label: 'Website', type: 'text' },
          { key: 'image0', label: 'Image 1 URL', type: 'text' },
          { key: 'image1', label: 'Image 2 URL', type: 'text' },
          { key: 'image2', label: 'Image 3 URL', type: 'text' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];

      case 'Miscellaneous':
        return [
          { key: 'localMap', label: 'Local Map Link', type: 'text' },
          { key: 'emergencyContacts', label: 'Emergency Contacts', type: 'text' },
          { key: 'hospital', label: 'Hospital Name', type: 'text' },
          { key: 'hospitalLocationLink', label: 'Hospital Location Link', type: 'text' },
          { key: 'hospitalLat', label: 'Hospital Latitude', type: 'number' },
          { key: 'hospitalLon', label: 'Hospital Longitude', type: 'number' },
          { key: 'PoliceLocationLink', label: 'Police Station Location Link', type: 'text' },
          { key: 'PoliceLat', label: 'Police Station Latitude', type: 'number' },
          { key: 'PoliceLon', label: 'Police Station Longitude', type: 'number' },
          { key: 'parking', label: 'Parking', type: 'text' },
          { key: 'parkingLocationLink', label: 'Parking Location Link', type: 'text' },
          { key: 'parkingLat', label: 'Parking Latitude', type: 'number' },
          { key: 'parkingLon', label: 'Parking Longitude', type: 'number' },
          { key: 'publicWashrooms', label: 'Public Washrooms', type: 'text' },
          { key: 'publicWashroomsLocationLink', label: 'Washrooms Location Link', type: 'text' },
          { key: 'publicWashroomsLat', label: 'Washrooms Latitude', type: 'number' },
          { key: 'publicWashroomsLon', label: 'Washrooms Longitude', type: 'number' },
          { key: 'premium', label: 'Premium', type: 'select', options: ['FREE', 'A', 'B'], default: 'FREE' },
        ];

      default:
        // Generic form for other categories
        return [
          { key: 'name', label: 'Name', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'price', label: 'Price', type: 'text' },
          { key: 'rating', label: 'Rating', type: 'number' },
          { key: 'image', label: 'Image URL', type: 'text' },
        ];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Process array fields and JSON-like fields
      const processedData = { ...formData };
      getFormFields().forEach(field => {
        if (field.type === 'array' && typeof processedData[field.key] === 'string') {
          processedData[field.key] = processedData[field.key]
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item);
        }
        if (category === 'Miscellaneous') {
          if (field.key === 'engagement' && typeof processedData.engagement === 'string') {
            try { processedData.engagement = JSON.parse(processedData.engagement); } catch { }
          }
          if (field.key === 'reviews' && typeof processedData.reviews === 'string') {
            try { processedData.reviews = JSON.parse(processedData.reviews); } catch { }
          }
        }
      });

      if (editData && editData._id) {
        await categoryApi.update(category, editData._id, processedData);
        // toast({
        //   title: "Success",
        //   description: "Item updated successfully",
        // });
      } else {
        await categoryApi.create(category, processedData);
        // toast({
        //   title: "Success", 
        //   description: "Item created successfully",
        // });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      //   toast({
      //     title: "Error",
      //     description: `Failed to ${editData ? 'update' : 'create'} item`,
      //     variant: "destructive",
      //   });
    } finally {
      setLoading(false);
    }
  };

  // const updateFormData = (key, value) => {
  //   setFormData(prev => ({ ...prev, [key]: value }));
  // };

  const fields = getFormFields();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-blue-100 shadow-professional">
          <DialogHeader className="space-y-3 pb-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center shadow-md">
                {editData ? <Edit className="w-5 h-5 text-blue-400" /> : <Plus className="w-5 h-5 text-blue-400" />}
              </div>
              <div>
                <DialogTitle className="text-xl text-slate-800">
                  {editData ? 'Edit' : 'Add'} {category} Entry
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  {editData ? 'Update' : 'Create'} {category.toLowerCase()} data for {city.cityName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 max-h-[50vh] overflow-y-auto pr-2">
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="text-slate-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>

                  {/* {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={formData[field.key] || ''}
                    onChange={(e) => updateFormData(field.key, e.target.value)}
                    required={field.required}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white min-h-[80px]"
                  />
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Checkbox
                      id={field.key}
                      checked={!!formData[field.key]}
                      onCheckedChange={(checked) => updateFormData(field.key, checked)}
                      className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label htmlFor={field.key} className="text-sm text-slate-700 cursor-pointer">
                      {field.label}
                    </Label>
                  </div>
                ) : field.type === 'array' ? (
                  <Input
                    id={field.key}
                    value={
                      Array.isArray(formData[field.key])
                        ? formData[field.key].join(', ')
                        : formData[field.key] || ''
                    }
                    onChange={(e) => updateFormData(field.key, e.target.value)}
                    placeholder="Separate multiple items with commas"
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                ) : (
                  <Input
                    id={field.key}
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={(e) => updateFormData(field.key, e.target.value)}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                )} */}

                  {field.key === 'locationLink' ||
                    field.key === 'hospitalLocationLink' ||
                    field.key === 'PoliceLocationLink' ||
                    field.key === 'parkingLocationLink' ||
                    field.key === 'publicWashroomsLocationLink' ? (
                    <Input
                      id={field.key}
                      type={field.type}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleLocationLinkChange(e.target.value, field.key)}
                      required={field.required}
                      placeholder="Paste Google Maps link to auto-fill name and coordinates"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    />
                  ) : field.type === 'textarea' ? (
                    <Textarea
                      id={field.key}
                      value={formData[field.key] || ''}
                      onChange={(e) => updateFormData(field.key, e.target.value)}
                      required={field.required}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white min-h-[80px]"
                    />
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Checkbox
                        id={field.key}
                        checked={!!formData[field.key]}
                        onCheckedChange={(checked) => updateFormData(field.key, checked)}
                        className="border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label htmlFor={field.key} className="text-sm text-slate-700 cursor-pointer">
                        {field.label}
                      </Label>
                    </div>
                  ) : field.type === 'array' ? (
                    <Input
                      id={field.key}
                      value={
                        Array.isArray(formData[field.key])
                          ? formData[field.key].join(', ')
                          : formData[field.key] || ''
                      }
                      onChange={(e) => updateFormData(field.key, e.target.value)}
                      placeholder="Separate multiple items with commas"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.key}
                      value={formData[field.key] || field.default || ''}
                      onChange={(e) => updateFormData(field.key, e.target.value)}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white rounded-md p-2"
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id={field.key}
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={(e) => updateFormData(field.key, e.target.value)}
                        required={field.required}
                        min={field.min}
                        max={field.max}
                        className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white flex-1"
                      />
                      {(field.key.toLowerCase().includes('image') || field.label.toLowerCase().includes('image')) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (formData[field.key]?.trim()) {
                              setPreviewUrl(formData[field.key]);
                              setShowPreview(true);
                            }
                          }}
                          disabled={!formData[field.key]?.trim()}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50 px-3"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-blue-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="gradient-primary text-white border-0 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : editData ? "Save Changes" : "Create Entry"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {
        showPreview && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '2rem'
            }}
            onClick={() => setShowPreview(false)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem', color: '#64748b' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  display: 'block',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML += '<div style="padding: 2rem; text-align: center; color: #ef4444;">Failed to load image</div>';
                }}
              />
            </div>
          </div>
        )}
    </>
  );
}