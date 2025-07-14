const fetch = require("node-fetch");

async function checkWarehouses() {
  try {
    const response = await fetch("http://localhost:8080/api/warehouses");
    const data = await response.json();

    console.log("Total warehouses:", data.data.length);

    // Look for Andijan variants
    const andrijanWarehouses = data.data.filter((w) => {
      const city = w.city.toLowerCase();
      return city.includes("andij") || city.includes("анд");
    });

    console.log("Andijan warehouses found:", andrijanWarehouses.length);
    andrijanWarehouses.forEach((w) => {
      console.log(`- ${w.name} in "${w.city}"`);
    });

    // Show first 10 warehouse cities for reference
    console.log("\nFirst 10 warehouse cities:");
    data.data.slice(0, 10).forEach((w) => {
      console.log(`- "${w.city}"`);
    });

    // Check API cities for Andijan
    const citiesResponse = await fetch("http://localhost:8080/api/cities");
    const citiesData = await citiesResponse.json();

    const andrijanCities = citiesData.data.filter((c) => {
      const name = c.name.toLowerCase();
      return name.includes("andij") || name.includes("анд");
    });

    console.log("\nAndijan cities from API:");
    andrijanCities.forEach((c) => {
      console.log(
        `- ID: ${c.id}, Name: "${c.name}" (length: ${c.name.length})`,
      );
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

checkWarehouses();
