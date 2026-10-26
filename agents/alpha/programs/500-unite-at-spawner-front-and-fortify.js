// programs/500-unite-at-spawner-front-and-fortify.js
console.log('=== Program 500: Spawner Assault Front — Fortify & Arm ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check nearby items and pick up
const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
console.log(`Found ${items.length} dropped items in reach:`);
for (const it of items) {
  console.log(`- Item at ${lib.fmt(it.position)}`);
}
if (items.length > 0) {
  try { await lib.pickup(8); } catch (e) {}
}

// 2. Check nearby teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'alpha') {
    const d = bot.entity.position.distanceTo(p.entity.position);
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)} (dist ${d.toFixed(1)}m)`);
  }
}

bot.chat('team: Alpha & Beta united at (44, 65, -170)! Gamma & Delta bring cobblestone to enclose spawner at (32, 68, -190)!');

// 3. Inspect wall and roof at current position (44, 65..67, -169..-173)
for (let z = -169; z >= -173; z--) {
  const floor = bot.blockAt(new Vec3(44, 64, z))?.name;
  const westWall65 = bot.blockAt(new Vec3(43, 65, z))?.name;
  const westWall66 = bot.blockAt(new Vec3(43, 66, z))?.name;
  const roof = bot.blockAt(new Vec3(44, 67, z))?.name;
  console.log(`z=${z}: floor(64)=${floor}, westWall(65)=${westWall65}, westWall(66)=${westWall66}, roof(67)=${roof}`);
}

await lib.equipWeapon();
await lib.equipArmor();

console.log('STATUS:');
console.log('Pos:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inventory:', JSON.stringify(lib.inv()));
