// programs/338-craft-shield-and-secure-spawner.js
console.log('=== CRAFT SHIELD & SECURE BLAZE SPAWNER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv before:', JSON.stringify(lib.inv()));

// 1. Pick up any drops on the balcony floor from teammates
console.log('Picking up drops on balcony deck...');
await lib.pickup(8);
console.log('Inv after pickup:', JSON.stringify(lib.inv()));

// 2. Craft planks from oak_log
if (lib.count('oak_log') > 0) {
  console.log('Crafting oak_planks...');
  await lib.craft('oak_planks', 4);
}
console.log('Planks total:', lib.count('*_planks'));

// 3. Craft crafting table and place it
if (lib.count('crafting_table') === 0 && lib.count('*_planks') >= 4) {
  console.log('Crafting crafting_table...');
  await lib.craft('crafting_table', 1);
}

// Check if a crafting table is already nearby
let table = bot.findBlocks({ matching: b => b && b.name === 'crafting_table', maxDistance: 6, count: 1 })[0];
if (!table && lib.count('crafting_table') > 0) {
  // Place crafting table against a solid block on the balcony
  const spot = bot.entity.position.floored().offset(0, 0, 1);
  console.log('Placing crafting table at:', lib.fmt(spot));
  try {
    await lib.place('crafting_table', spot.x, spot.y, spot.z);
    table = spot;
  } catch (e) {
    console.log('Place table note:', e.message);
  }
}

// 4. Craft SHIELD (needs 6 planks + 1 iron ingot)
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6 && lib.count('shield') === 0) {
  console.log('Crafting SHIELD...');
  try {
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED SUCCESSFULLY!');
  } catch (e) {
    console.log('Craft shield error:', e.message);
  }
}

// 5. Equip Shield in offhand & weapon in main hand
await lib.equipArmor();
await lib.equipWeapon();

console.log('Tools/Gear:', JSON.stringify(lib.tools()));
console.log('Offhand item:', bot.inventory.slots[45]?.name || 'none');

// 6. Inspect Spawner at (32, 68, -190)
const spawnerPos = new Vec3(32, 68, -190);
const spawnerBlock = bot.blockAt(spawnerPos);
console.log('Spawner block at (32, 68, -190):', spawnerBlock ? spawnerBlock.name : 'null');

// Survey 5x5 around spawner at y=67..69
console.log('Surroundings of Spawner at y=67 (floor), y=68 (spawner), y=69 (ceiling):');
for (let y = 67; y <= 69; y++) {
  let layer = `y=${y}: `;
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      const p = spawnerPos.offset(dx, y - spawnerPos.y, dz);
      const b = bot.blockAt(p);
      if (b && b.name !== 'air') {
        layer += `[${dx},${dz}:${b.name}] `;
      }
    }
  }
  console.log(layer);
}

// Check Blazes
const blazes = Object.values(bot.entities).filter(e => e && e.name === 'blaze');
console.log(`Blazes visible (${blazes.length}):`);
for (const b of blazes) {
  console.log(`  Blaze at ${lib.fmt(b.position)} (dist: ${bot.entity.position.distanceTo(b.position).toFixed(1)}m, HP: ${b.health})`);
}

// Check Blaze Rods in inventory
console.log('Blaze rods in inventory:', lib.count('blaze_rod'));
bot.chat(`gamma on Spawner Balcony! Shield: ${lib.count('shield')}, Cobble: ${lib.count('cobblestone')}, Blazes: ${blazes.length}, Rods: ${lib.count('blaze_rod')}`);
