// programs/878-shelter-heal-and-scan-dragon.js
console.log('=== Program 878: Shelter, Heal & Scan Dragon ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Keep gaze low immediately to avoid aggroing Endermen
await bot.look(bot.entity.yaw, -Math.PI / 3, true);

// 2. Equip netherite_sword!
const netherite = bot.inventory.items().find(i => i.name.includes('netherite_sword'));
if (netherite) {
  await bot.equip(netherite, 'hand');
  console.log('Equipped Netherite Sword!');
}

// 3. Scan for Ender Dragon
const dragon = Object.values(bot.entities).find(e => e.name === 'ender_dragon');
if (dragon) {
  console.log(`ENDER DRAGON: pos=${lib.fmt(dragon.position)}, health=${dragon.health !== undefined ? dragon.health : 'active'}`);
  bot.chat(`alpha: Ender Dragon at ${lib.fmt(dragon.position)}! Alpha at (79, 55, 30) with Netherite Sword!`);
}

// 4. Scan for all End Crystals on obsidian pillars
const crystals = Object.values(bot.entities).filter(e => e.name === 'end_crystal');
console.log(`Detected ${crystals.length} End Crystals:`);
for (const c of crystals) {
  console.log(`  End Crystal at ${lib.fmt(c.position)}, dist: ${bot.entity.position.distanceTo(c.position).toFixed(1)}m`);
}

// 5. Scan teammates
const teammates = Object.values(bot.entities).filter(e => ['beta', 'gamma', 'delta'].includes(e.username));
console.log(`Teammates nearby: ${teammates.length}`);
for (const tm of teammates) {
  console.log(`  Teammate ${tm.username} at ${lib.fmt(tm.position)}, HP: ${tm.health}`);
}

// 6. Safe recovery: dig 2 blocks into end stone to create a 2-high anti-Enderman alcove
// Endermen are 3 blocks tall; they CANNOT enter a 2-high alcove!
console.log('Creating a safe 2-high alcove to regenerate health to full...');
const dir = new Vec3(-1, 0, 0); // West into the island
const p = bot.entity.position;

const bFeet = bot.blockAt(p.offset(dir.x, 0, dir.z));
const bHead = bot.blockAt(p.offset(dir.x, 1, dir.z));
const bAbove = bot.blockAt(p.offset(dir.x, 2, dir.z));

const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

if (bHead && bHead.boundingBox === 'block') {
  try { await bot.dig(bHead, true); } catch (e) {}
}
if (bFeet && bFeet.boundingBox === 'block') {
  try { await bot.dig(bFeet, true); } catch (e) {}
}

// Step into the 2-high alcove
await bot.lookAt(p.offset(dir.x, 0.5, dir.z), true);
bot.setControlState('forward', true);
await sleep(500);
bot.clearControlStates();

// Wait for natural health regeneration
console.log('Resting in 2-high alcove while health regenerates...');
const regenStart = Date.now();
while (bot.health < 18 && Date.now() - regenStart < 15000) {
  await sleep(1000);
  console.log(`Health: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20`);
}

if (netherite) await bot.equip(netherite, 'hand');
console.log(`Alpha ready for combat: HP=${bot.health}, Food=${bot.food}, Pos=${lib.fmt(bot.entity.position)}`);
