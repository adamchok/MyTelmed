const address = encodeURIComponent("Klinik Desa Bagan Pasir, 45500 Tanjung Karang, Selangor");
const apiKey = process.env.GOOGLE_MAP_API_KEY;

if (!apiKey) {
  console.error("Google Maps API key is missing!");
  process.exit(1);
}

const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;

fetch(url)
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      console.log("Latitude:", lat);
      console.log("Longitude:", lng);
    } else {
      console.error("Geocoding API returned no results or error:", data.status);
    }
  })
  .catch((err) => {
    console.error("Fetch error:", err.message);
  });
