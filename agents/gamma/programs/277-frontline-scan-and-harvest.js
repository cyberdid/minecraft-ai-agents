// programs/277-frontline-scan-and-harvest.js
console.log('=== FRONTLINE SCAN, ITEM RECOVERY & ADVANCE ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);

// 1. Check for any dropped items nearby
const droppedItems = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 20);
console.log(`Dropped items within 20m (${droppedItems.length}):`);
for (const item of droppedItems) {
  console.log(`  - Item at ${lib.fmt(item.position)} dist=${bot.entity.position.distanceTo(item.position).toFixed(1)}m`);
}

// Safely pickup any items right next to us
try {
  await lib.pickup(5);
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

// 2. Scan floor from z=-167 to z=-185 at x=44 and x=43 and x=42
console.log('\n--- Grid Floor Scan (y=64) ---');
for (let z = -167; z >= -185; z--) {
  let row = `z=${z}: `;
  for (let x = 45; x >= 37; x--) {
    const b = bot.blockAt(new Vec3(x, 64, z));
    const name = b ? b.name : 'air';
    row += `x${x}:${name === 'air' ? '___' : name.slice(0, 4)} `;
  }
  console.log(row);
}

// 3. Scan the Spawner at (32, 68, -190)
const spawnerPos = new Vec3(32, 68, -190);
const spawnerBlock = bot.blockAt(spawnerPos);
console.log(`\nSpawner block at (32, 68, -190): ${spawnerBlock ? spawnerBlock.name : 'unknown/unloaded'}`);

// Scan 5x5 around spawner at y=67, 68, 69
console.log('--- Surroundings of Spawner (y=67..69, x=30..34, z=-188..-192) ---');
for (let y = 67; y <= 69; y++) {
  for (let z = -188; z >= -192; z--) {
    let row = `y=${y} z=${z}: `;
    for (let x = 30; x <= 34; x++) {
      const b = bot.blockAt(new Vec3(x, y, z));
      row += `x${x}:${b ? (b.name === 'air' ? '.' : b.name.slice(0, 3)) : '?'} `;
    }
    console.log(row);
  }
}

// 4. Scan Blazes
const blazes = Object.values(bot.entities).filter(e => e.name === 'blaze');
console.log(`\nActive Blazes (${blazes.length}):`);
for (const b of blazes) {
  console.log(`  - Blaze at ${lib.fmt(b.position)} dist=${bot.entity.position.distanceTo(b.position).toFixed(1)}m`);
}

// 5. Carefully advance along existing safe floor to z = -175
console.log('\n--- Advancing to z = -175 ---');
const floor175 = bot.blockAt(new Vec3(44, 64, -175));
if (floor175 && floor175.boundingBox === 'block') {
  console.log('Solid floor confirmed at (44, 64, -175). Moving to (44, 65, -175)...');
  try {
    await lib.goTo(44, 65, -175, 1, { timeoutMs: 8000 });
    console.log('Reached (44, 65, -175)! Pos:', lib.fmt(bot.entity.position));
  } catch (e) {
    console.log('Move note:', e.message);
  }
} else {
  console.log('WARNING: (44, 64, -175) is NOT solid!');
}

// Pickup again at z=-175
try {
  await lib.pickup(6);
  await lib.equipArmor();
  await lib.equipWeapon();
} catch (e) {}

// 6. Check inventory and surroundings at z=-175
console.log('\n=== STATUS AT END OF PROGRAM ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
console.log('Dist to spawner:', bot.entity.position.distanceTo(spawnerPos).toFixed(1));

bot.chat(`gamma at ${lib.fmt(bot.entity.position)}! Dist to Spawner: ${bot.entity.position.distanceTo(spawnerPos).toFixed(1)}m, Blazes: ${blazes.length}, Cobble: ${lib.count('cobblestone')}`);
