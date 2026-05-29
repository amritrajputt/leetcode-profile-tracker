import NodeCache from "node-cache";

// Initialize in-memory cache with 5 minutes TTL (300 seconds)
export const cache = new NodeCache({ stdTTL: 300 });
