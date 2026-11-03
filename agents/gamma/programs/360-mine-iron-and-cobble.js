// programs/360-mine-iron-and-cobble.js
console.log('=== QUARRY COBBLESTONE & ACQUIRE SHIELD ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Inv:', JSON.stringify(lib.inv()));

// 1. Mine stone until we have at least 35 cobblestone
const targetCobble = 35;
while (lib.count('cobblestone') < targetCobble && !isCancelled()) {
  try {
    await lib.collect('stone', targetCobble - lib.count('cobblestone'));
  } catch (e) {
    console.log('Collect stone note:', e.message);
    break;
  }
}
console.log('Cobblestone count:', lib.count('cobblestone'));

// 2. Scan for iron ore
let ironOres = lib.find(['iron_ore', 'deepslate_iron_ore'], { maxDistance: 32, count: 5 });
console.log('Found iron ores:', ironOres.map(o => `${o.name} at ${lib.fmt(o.position)}`).join(', ') || 'none');

if (ironOres.length > 0) {
  const io = ironOres[0];
  console.log(`Mining iron ore at ${lib.fmt(io.position)}...`);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(io.position.x, io.position.y, io.position.z, 2));
    await lib.dig(io.position.x, io.position.y, io.position.z);
    await lib.pickup(4);
    console.log('Mined iron ore! Raw iron count:', lib.count('raw_iron'));
  } catch (e) {
    console.log('Dig iron error:', e.message);
  }
}

// 3. Smelt raw iron if we have it
if (lib.count('raw_iron') > 0 && lib.count('iron_ingot') === 0) {
  console.log('Smelting 1 raw_iron...');
  try {
    await lib.smelt('raw_iron', 'coal', 1);
  } catch (e) {
    try { await lib.smelt('raw_iron', 'birch_planks', 1); } catch (e2) {}
  }
}

// 4. Craft shield if we have iron ingot
if (lib.count('iron_ingot') >= 1 && lib.count('shield') === 0) {
  console.log('Crafting SHIELD...');
  try {
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED SUCCESSFULLY!');
  } catch (e) {
    console.log('Shield craft error:', e.message);
  }
}

// 5. Equip armor, shield and weapon
try {
  await lib.equipArmor();
  await lib.equipWeapon();
  console.log('Equipped gear! Tools:', JSON.stringify(lib.tools()));
} catch (e) {}

console.log('Ending inv:', JSON.stringify(lib.inv()));
