export async function fetchAirports(n) {
  n ||= 15;
  try {
    const response = await fetch(
      `http://localhost:8000/airports?seed=sussysus&amount=${n}`
    );
    return response.json();
  } catch (e) {
    console.error(e);
    console.warn("Failed to fetch from a local connection, using mock data.");

    // Generate a complete graph of the airports

    let points = [];
    for (let i = 0; i < n; i++) {
      const lat = (2 * Math.random() - 1) * 90;
      const lon = (2 * Math.random() - 1) * 180;
      points.push([lat, lon]);
    }

    const airports = [];
    for (let i = 0; i < points.length; i++) {
      // @ts-ignore
      const [lat, lon] = points[i];
      airports.push({
        name: String.fromCharCode(97 + (i % 26)),
        latitude_deg: lat,
        longitude_deg: lon,
        iso_country: "ZZ",
      });
    }

    const connections = [];
    for (let i = 0; i < airports.length; i++) {
      let a = Math.floor(Math.random() * airports.length);
      let b = Math.floor(Math.random() * airports.length);
      if (a == b)
        continue;
      const con = [a + b - Math.min(a, b), a + b - Math.max(a, b)];
      connections.push(con);
    }

    console.log(airports, connections);

    return { airports, connections };
  }
}
