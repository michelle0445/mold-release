const fs = require("fs");
const p = "C:\\Users\\Moral033\\mold-release\\src\\app\\page.tsx";
let c = fs.readFileSync(p, "utf8");
c = c.replace(/<Toaster[^>]*\/>/g, "");
fs.writeFileSync(p, c, "utf8");
console.log("Toaster removido de page.tsx");