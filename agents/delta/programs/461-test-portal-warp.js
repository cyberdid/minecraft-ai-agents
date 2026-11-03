console.log("isCancelled():", isCancelled());
console.log("bot.game.dimension:", bot.game.dimension);
console.log("bot.entity.position:", bot.entity.position);
const start = Date.now();
console.log("Starting 3s sleep...");
await sleep(3000);
console.log("After sleep. Elapsed:", Date.now() - start, "dimension:", bot.game.dimension);
