// Verified Indonesian tsunami records from NOAA NCEI.
const tsunamiEvents = [
  { id: 0, sourceId: 1142, year: 1883, name: "Krakatau", mag: "-", height: 41, victims: 36417, cause: "Erupsi vulkanik", lat: -6.102, lng: 105.423 },
  { id: 1, sourceId: 1197, year: 1892, name: "Gunung Awu, Kepulauan Sangihe", mag: "-", height: 0.75, victims: 1532, cause: "Erupsi vulkanik", lat: 3.67, lng: 125.5 },
  { id: 2, sourceId: 2214, year: 1992, name: "Flores", mag: 7.8, height: 26.2, victims: 2500, cause: "Gempa bumi", lat: -8.48, lng: 121.896 },
  { id: 3, sourceId: 2227, year: 1994, name: "Jawa Selatan", mag: 7.8, height: 13.9, victims: 238, cause: "Gempa bumi", lat: -10.477, lng: 112.835 },
  { id: 4, sourceId: 2260, year: 1996, name: "Biak, Papua", mag: 8.2, height: 7.7, victims: 164, cause: "Gempa bumi", lat: -0.891, lng: 136.952 },
  { id: 5, sourceId: 2439, year: 2004, name: "Lepas Pantai Barat Sumatra", mag: 9.1, height: 50.9, victims: 227899, cause: "Gempa bumi", lat: 3.295, lng: 95.982 },
  { id: 6, sourceId: 2487, year: 2005, name: "Nias, Sumatra", mag: 8.6, height: 4.2, victims: 1319, cause: "Gempa bumi", lat: 2.085, lng: 97.108 },
  { id: 7, sourceId: 2832, year: 2006, name: "Jawa Selatan", mag: 7.7, height: 20.9, victims: 802, cause: "Gempa bumi", lat: -9.284, lng: 107.419 },
  { id: 8, sourceId: 5689, year: 2018, name: "Palu, Sulawesi", mag: 7.5, height: 10.73, victims: 4340, cause: "Gempa bumi", lat: -0.256, lng: 119.846 },
];

const tsunamiSourceUrl = "https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/events/";
