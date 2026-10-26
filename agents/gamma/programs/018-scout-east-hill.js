// programs/018-scout-east-hill.js
bot.chat('gamma heading to East hill (350, 55, -35) to scout iron & food!');

console.log('gamma pos:', lib.fmt(bot.entity.position));

// Go through door to outside
await lib.door(294, 72, -54, true);
await bot.pathfinder.goto(new goals.GoalBlock(294, 72, -53));
await lib.door(294, 72, -54, false);

// Head East towards (340, 65, -40)
console.log('Traveling towards East hill (340, 65, -40)...');
try {
  await lib.goTo(335, 65, -45, 3, { dig: true });
} catch (e) {
  console.log('GoTo error:', e.message);
}

console.log('Reached', lib.fmt(bot.entity.position));

// Scan for ores
const iron = bot.findBlocks({ matching: (b) => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore', maxDistance: 32, count: 20 })
  .map(p => lib.fmt(p));
const coal = bot.findBlocks({ matching: (b) => b.name === 'coal_ore' || b.name === 'deepslate_coal_ore', maxDistance: 32, count: 20 })
  .map(p => lib.fmt(p));

console.log(`Found ${iron.length} iron ores:`, iron);
console.log(`Found ${coal.length} coal ores:`, coal);

// Scan for animals
const animals = Object.values(bot.entities)
  .filter(e => e.name && ['cow', 'sheep', 'pig', 'chicken'].includes(e.name) && e.position)
  .map(e => ({ name: e.name, pos: lib.fmt(e.position), dist: e.position.distanceTo(bot.entity.position).toFixed(1) }));
console.log('Animals around East hill:', JSON.stringify(animals));

console.log('Time until night:', lib.time().secondsUntilNight);
bot.chat(`gamma at East hill! Iron ores found: ${iron.length}, Coal ores: ${coal.length}, Animals: ${animals.length}`);
