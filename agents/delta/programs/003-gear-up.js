// programs/003-gear-up.js
console.log('Time start:', JSON.stringify(lib.time()));

// Step out through door
const door = bot.findBlocks({ matching: b => b.name.includes('door'), maxDistance: 6, count: 1 })[0];
if (door) {
  console.log('Going out through door:', lib.fmt(door));
  await lib.goThroughDoor(door.x, door.y, door.z);
}

// Collect 8 logs
console.log('Collecting logs...');
const gainedLogs = await lib.collect('*_log', 8);
console.log('Gained logs:', JSON.stringify(gainedLogs));

// Craft planks & sticks
const logType = Object.keys(lib.inv()).find(k => k.endsWith('_log'));
if (logType) {
  const plankType = logType.replace('_log', '_planks');
  await lib.craft(plankType, 16);
  await lib.craft('stick', 12);
}

// Craft stone tools (we have cobblestone in inventory!)
await lib.craft('stone_pickaxe', 2);
await lib.craft('stone_sword', 1);
await lib.craft('stone_axe', 1);

await lib.equipWeapon();

// Scan for nearby animals and ores
const animals = ['sheep', 'cow', 'pig', 'chicken'].map(type => {
  const count = bot.entities ? Object.values(bot.entities).filter(e => e.name === type && e.position.distanceTo(bot.entity.position) < 48).length : 0;
  return `${type}:${count}`;
}).join(', ');
console.log('Nearby animals (48m):', animals);

const coalOres = bot.findBlocks({ matching: b => b.name.includes('coal_ore'), maxDistance: 48, count: 10 });
const ironOres = bot.findBlocks({ matching: b => b.name.includes('iron_ore'), maxDistance: 48, count: 10 });
console.log(`Nearby ores: coal=${coalOres.length}, iron=${ironOres.length}`);

console.log('Inventory now:', JSON.stringify(lib.inv()));
console.log('Time end:', JSON.stringify(lib.time()));
bot.chat('delta: Crafted stone pickaxe, sword, and axe! Wood gathered.');
