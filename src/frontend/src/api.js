import { Airport } from './game'

export async function fetchAirports(n) {
    n ||= 15;
    try {
        const response = await fetch(`http://localhost:8000/airports?seed=sussysus&amount={n}`);
        return response.json();
    } catch (e) {
        console.error(e);
        console.warn("Failed to fetch from a local connection, using mock data.")

        // Generate a complete graph of the airports
        let points = []
        for (let i = 0; i < n; i++) {
            const lat = (2 * Math.random() - 1) * 90;
            const lon = (2 * Math.random() - 1) * 180;
            points.push([lat, lon])
        }

        const airports = [];
        for (let i = 0; i < points.length; i++) {
            const [lat, lon] = points[i];
            airports.push(new Airport(
                String.fromCharCode(97 + i % 26),
                lat,
                lon,
                "ZZ",
            ))
        }

        const connections = [];

        console.log(airports)

        return { airports, connections }
    }
}
