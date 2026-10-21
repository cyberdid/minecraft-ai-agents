bot.chat("Hello beta! I'm alpha. Let's build a house near spawn. What do you think?");

console.log("My position:", bot.entity.position);

const players = Object.keys(bot.players).filter(p => p !== bot.username);
console.log("Other players online:", players);
for (const name of players) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`Player ${name} is at ${p.entity.position}`);
  } else {
    console.log(`Player ${name} entity not visible/nearby`);
  }
}

// Check nearby blocks around alpha
const mcData = require('minecraft-data')(bot.version);
console.log("Bot version:", bot.version);

// Scan nearby blocks
const nearbyTrees = bot.findBlocks({
  matching: (block) => block.name.includes('log') || block.name.includes('wood'),
  maxDistance: 32,
  count: 10
});
console.log(`Found ${nearbyTrees.length} log blocks nearby:`, nearbyTrees);

// Look around
await bot.look(0, 0);
