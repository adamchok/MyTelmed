const calculateDistanceFromAddress = async (
  userLatitude: number,
  userLongitude: number,
  facilityAddress: string
): Promise<number | null> => {
  const apiKey = process.env.GOOGLE_MAP_API_KEY;
  const encodedAddress = encodeURIComponent(facilityAddress);
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&address=${encodedAddress}`;

  const response = await fetch(geocodeUrl);
  const data = await response.json();

  if (data.status !== "OK" || !data.results[0]) {
    console.warn("Geocoding failed:", data.status);
    return null;
  }

  const { lat: facilityLatitude, lng: facilityLongitude } = data.results[0].geometry.location;

  const R = 6371; // Earth's radius in km
  const dLat = ((facilityLatitude - userLatitude) * Math.PI) / 180;
  const dLon = ((facilityLongitude - userLongitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((userLatitude * Math.PI) / 180) * Math.cos((facilityLatitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

export default calculateDistanceFromAddress;
