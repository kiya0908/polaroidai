require("dotenv").config({ path: ".env.local" });

function printEnvPresence(name) {
  console.log(`${name}: ${process.env[name] ? "set" : "missing"}`);
}

printEnvPresence("DATABASE_URL");
printEnvPresence("DIRECT_URL");
printEnvPresence("UPSTASH_REDIS_REST_URL");
printEnvPresence("UPSTASH_REDIS_REST_TOKEN");
printEnvPresence("KIE_AI_API_KEY");
printEnvPresence("CLERK_SECRET_KEY");
