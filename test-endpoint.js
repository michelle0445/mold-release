const http = require("http");

const data = JSON.stringify({
  moldNumber: "MOLDE-TEST",
  reason: "Prueba directa",
  employeeId: 1,
  priority: "NORMAL"
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/requests",
  method: "POST",
  headers: { "Content-Type": "application/json", "Content-Length": data.length }
};

const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => body += chunk);
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", body);
  });
});

req.on("error", (e) => {
  console.error("Fallo la conexion:", e.message);
  console.log("El servidor Next.js esta corriendo?");
});

req.write(data);
req.end();