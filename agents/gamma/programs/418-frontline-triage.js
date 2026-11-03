// programs/418-frontline-triage.js
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check nearby items on ground
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) <= 12);
console.log(`Found ${items.length} dropped items nearby:`);
for (const it of items) {
  console.log(`  Item at ${lib.fmt(it.position)}: dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}`);
}

// 2. Safe pickup
if (items.length > 0) {
  try {
    const p = await lib.pickup(4);
    console.log(`Picked up ${p} items!`);
  } catch (e) {
    console.log('Pickup note:', e.message);
  }
}

// 3. Equip any recovered armor/shields/weapons
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// 4. Check if we picked up food and eat
if (bot.food < 20) {
  try { await lib.eat(); } catch (e) {}
}

console.log('Updated Inv:', JSON.stringify(lib.inv()), 'HP:', bot.health, 'Food:', bot.food);

// 5. Step under the roof at (37, 65, -177)
console.log('Moving into covered walkway under roof at (37, 65, -177)...');
try {
  await lib.goTo(37.0, 65.0, -177.0, 1.0, { dig: false, timeoutMs: 4000 });
} catch (e) {
  console.log('Step to roof note:', e.message);
}

// 6. Check solid walls to west (x=38, y=66..67, z=-176)
const wall1 = bot.blockAt(new Vec3(38, 66, -176));
const wall2 = bot.blockAt(new Vec3(38, 67, -176));
console.log('Wall block at (38, 66, -176):', wall1 ? wall1.name : 'null');
console.log('Wall block at (38, 67, -176):', wall2 ? wall2.name : 'null');

if (wall1 && (wall1.name === 'air' || wall1.name === 'cave_air') && lib.count('cobblestone') > 0) {
  console.log('Sealing blast wall at (38, 66, -176)...');
  try {
    await lib.place('cobblestone', 38, 66, -176);
  } catch (e) {}
}

console.log('Final Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health);
