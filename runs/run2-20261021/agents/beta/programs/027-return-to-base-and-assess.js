console.log('Walking from spawn to base (10, 67, -25)...');
await lib.goTo(10, 67, -25, 2);
console.log('Arrived at base! Bot pos:', lib.fmt(bot.entity.position));

// Check alpha
const alpha = bot.players.alpha?.entity;
console.log('Alpha pos:', alpha ? lib.fmt(alpha.position) : 'unknown');

// Check the door at (12, 67, -21)
const doorBlock = bot.blockAt(new Vec3(12, 67, -21));
console.log('Door at (12, 67, -21):', doorBlock ? doorBlock.name : 'none');

// Collect 16 dirt for safety protocol
console.log('Collecting 16 dirt/sand for safety...');
try {
  await lib.collect('sand', 16);
} catch (e) {
  console.log('Sand note:', e.message);
}

// Check nearby crafting table
const table = bot.findBlock({ matching: mcData.blocksByName.crafting_table.id, maxDistance: 16 });
console.log('Crafting table nearby:', table ? lib.fmt(table.position) : 'none');

// Check nearby chest
const chest = bot.findBlock({ matching: mcData.blocksByName.chest.id, maxDistance: 16 });
console.log('Chest nearby:', chest ? lib.fmt(chest.position) : 'none');
if (chest) {
  const contents = await lib.chestContents(chest.position.x, chest.position.y, chest.position.z);
  console.log('Chest contents:', JSON.stringify(contents));
}

// Check house progress
const bpSandstoneRoof = lib.shapes.house({
  x: 10,
  y: 67,
  z: -25,
  width: 5,
  depth: 5,
  height: 3,
  wall: 'sandstone',
  roof: 'sandstone',
  door: 'south',
  windows: true
});

let placedCount = 0;
for (const b of bpSandstoneRoof) {
  const cur = bot.blockAt(new Vec3(b.x, b.y, b.z));
  if (cur && cur.name === b.name) placedCount++;
}
console.log(`House with sandstone: ${placedCount}/${bpSandstoneRoof.length} placed`);

bot.chat(`alpha: Respawned safe at base! Door is placed. Let's make roof sandstone too so we don't cross the river. What do you think?`);

return lib.status();
