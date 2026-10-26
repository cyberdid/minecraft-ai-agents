// programs/280-scan-entities-and-frontline.js
console.log('Delta pos:', lib.fmt(bot.entity.position));

// Equip stone_sword
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) {
  await bot.equip(sword, 'hand');
  console.log('Equipped stone_sword');
}

console.log('=== PLAYERS ===');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    const dist = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} (dist: ${dist.toFixed(1)}m, HP: ${p.entity.metadata?.[9] ?? '?'})`);
  }
}

console.log('=== MOBS ===');
for (const e of Object.values(bot.entities)) {
  if (e && e !== bot.entity && (e.type === 'mob' || e.type === 'hostile' || e.name === 'wither_skeleton' || e.name === 'blaze' || e.name === 'skeleton')) {
    const dist = bot.entity.position.distanceTo(e.position);
    if (dist < 35) {
      console.log(`Mob ${e.name} at ${lib.fmt(e.position)} (dist: ${dist.toFixed(1)}m, type: ${e.type})`);
    }
  }
}

console.log('=== DROPPED ITEMS ===');
for (const e of Object.values(bot.entities)) {
  if (e && (e.name === 'item' || e.type === 'object')) {
    const dist = bot.entity.position.distanceTo(e.position);
    if (dist < 25) {
      console.log(`Item at ${lib.fmt(e.position)} (dist: ${dist.toFixed(1)}m)`);
    }
  }
}

// Check bridge line from x=39 to x=32, z=-175 to z=-192
console.log('=== BRIDGE / SPAWNER BLOCKS ===');
const spawnerPos = new Vec3(32, 68, -190);
const spawnerBlock = bot.blockAt(spawnerPos);
console.log(`Spawner block at (32, 68, -190): ${spawnerBlock ? spawnerBlock.name : 'unloaded'}`);

// Scan floor from (37, 64, -176) to (37, 64, -188)
for (let z = -176; z >= -188; z--) {
  const b = bot.blockAt(new Vec3(37, 64, z));
  const bAbove = bot.blockAt(new Vec3(37, 65, z));
  console.log(`(37, 64, ${z}): ${b ? b.name : 'null'} | above: ${bAbove ? bAbove.name : 'null'}`);
}
