// programs/576-inspect-balcony-deck-and-engage.js
console.log('=== Program 576: Inspect Balcony Deck & Engage Spawner ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Swords:', lib.count('stone_sword'), 'Cobble:', lib.count('cobblestone'));

await lib.equipWeapon();

// Check nearby item drops right around Alpha
const groundItems = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 8);
console.log(`Found ${groundItems.length} item drops near Alpha:`);
if (groundItems.length > 0) {
  try { await lib.pickup(8); } catch (e) {}
}

// Inspect bridge blocks leading forward towards Spawner Balcony (34, 67, -187)
console.log('--- Inspecting path to (34, 67, -187) ---');
const spawnerDeck = new Vec3(34, 67, -187);
const spawnerPos = new Vec3(32, 68, -190);

console.log(`Distance to deck connection (34, 67, -187): ${bot.entity.position.distanceTo(spawnerDeck).toFixed(1)}m`);
console.log(`Distance to spawner (32, 68, -190): ${bot.entity.position.distanceTo(spawnerPos).toFixed(1)}m`);

// Step forward along cross-bridge towards x=37
const bridgePath = [
  new Vec3(38, 66, -176),
  new Vec3(37, 66, -177),
  new Vec3(36, 66, -180),
  new Vec3(35, 67, -184),
  new Vec3(34, 67, -187) // Deck!
];

for (let i = 0; i < bridgePath.length; i++) {
  if (isCancelled()) break;
  const p = bridgePath[i];
  
  // Verify solid floor under next step
  const fl = bot.blockAt(new Vec3(p.x, p.y - 1, p.z));
  console.log(`Step ${i + 1} to ${lib.fmt(p)}: floor(y=${p.y - 1}) is ${fl?.name} (solid: ${fl?.boundingBox === 'block'})`);
  
  if (fl && fl.boundingBox === 'block') {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y, p.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  } else {
    console.log(`Floor missing at ${lib.fmt(p)}, placing support...`);
    try {
      await lib.place('cobblestone', p.x, p.y - 1, p.z);
    } catch (pe) {
      console.log('Place note:', pe.message);
    }
  }
  
  // Pick up any items along the path
  try { await lib.pickup(6); } catch (e) {}
  console.log(`Current pos: ${lib.fmt(bot.entity.position)}`);
}

console.log('Frontline position reached:', lib.fmt(bot.entity.position));
await lib.equipWeapon();

// Check for hostiles & Blazes
const hostiles = lib.hostiles(16);
console.log(`Hostiles nearby (${hostiles.length}):`, hostiles.map(h => `${h.name} at ${lib.fmt(h.pos)} (${h.dist.toFixed(1)}m)`));

// Attack any Blaze within 4.5m
for (const h of hostiles) {
  if (isCancelled()) break;
  if (h.name === 'blaze' && h.dist < 5.0) {
    console.log(`Striking Blaze at ${lib.fmt(h.pos)}...`);
    try {
      await lib.fight('blaze');
      await lib.pickup(6);
    } catch (fe) {
      console.log('Fight note:', fe.message);
    }
  }
}

try { await lib.pickup(8); } catch (e) {}
const rods = lib.count('blaze_rod');
console.log(`=== Blaze Rods Harvested: ${rods} ===`);
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());
bot.chat(`alpha: On Spawner Balcony deck ${lib.fmt(bot.entity.position)}! Blaze rods: ${rods}, HP: ${bot.health.toFixed(1)}/20`);
