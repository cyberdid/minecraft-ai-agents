// programs/323-traverse-to-fortress.js
console.log('=== TRAVERSE TO FORTRESS WORKSHOP ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Craft a wooden sword immediately for defense
if (lib.count('*_sword') === 0 && lib.count('*_planks') >= 2) {
  console.log('Crafting wooden sword in inventory...');
  try {
    await lib.craft('wooden_sword', 1);
    await lib.equipWeapon();
    console.log('Equipped wooden_sword!');
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

// 2. Mine 20 netherrack right here for building blocks
console.log('Mining netherrack for fast barricades/blocks...');
const sp = bot.inventory.items().find(i => i.name === 'stone_pickaxe');
if (sp) await bot.equip(sp, 'hand');

const netherracks = bot.findBlocks({
  matching: b => b && b.name === 'netherrack',
  maxDistance: 4,
  count: 25
});
for (const p of netherracks) {
  if (lib.count('netherrack') >= 20 || isCancelled()) break;
  const b = bot.blockAt(p);
  if (b) {
    try {
      await bot.lookAt(p.offset(0.5, 0.5, 0.5));
      await bot.dig(b);
    } catch (e) {}
  }
}
await sleep(200);
await lib.pickup(4);
console.log('Netherrack count:', lib.count('netherrack'));

// Re-equip weapon
await lib.equipWeapon();

// 3. Move west to East Ridge Trail at (63, 65, -15)
console.log('Moving to East Ridge Trail at (63, 65, -15)...');
try {
  await lib.goTo(63, 65, -15, 1.5, { timeoutMs: 8000 });
} catch (e) {
  try { await lib.goToXZ(63, -15, { timeoutMs: 6000 }); } catch (e2) {}
}

console.log('At East Ridge trail:', lib.fmt(bot.entity.position));

// 4. March through safe East Ridge waypoints to Fortress Workshop Bunker
const ridgeWaypoints = [
  { name: 'Ridge Mid-South (62.5, 66, -30)', pos: new Vec3(62.5, 66.0, -30) },
  { name: 'Ridge Mid (62.0, 65, -55)', pos: new Vec3(62.0, 65.0, -55) },
  { name: 'Ridge North (62.0, 66, -80)', pos: new Vec3(62.0, 66.0, -80) },
  { name: 'Ridge North Bend (61.0, 66, -100)', pos: new Vec3(61.0, 66.0, -100) },
  { name: 'Fortress Approach (50, 65, -115)', pos: new Vec3(50.0, 65.0, -115) },
  { name: 'Fortress Workshop Bunker (44, 65, -127)', pos: new Vec3(44.0, 65.0, -127) }
];

for (let i = 0; i < ridgeWaypoints.length && !isCancelled(); i++) {
  const wp = ridgeWaypoints[i];
  console.log(`[WP ${i + 1}/${ridgeWaypoints.length}] Moving to ${wp.name}...`);
  try {
    await lib.goTo(wp.pos.x, wp.pos.y, wp.pos.z, 2, { timeoutMs: 14000 });
  } catch (e) {
    try {
      await lib.goToXZ(wp.pos.x, wp.pos.z, { timeoutMs: 10000 });
    } catch (e2) {
      console.log(`Move note for ${wp.name}:`, e2.message);
    }
  }

  try { await lib.pickup(5); } catch (e) {}

  // Check health and hostiles
  const hostiles = lib.hostiles(10);
  if (hostiles.length > 0) {
    console.log('Hostiles nearby:', JSON.stringify(hostiles));
  }
}

console.log('\n=== STATUS AT FORTRESS WORKSHOP ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma reached Fortress Workshop at ${lib.fmt(bot.entity.position)}! Netherrack: ${lib.count('netherrack')}, HP: ${bot.health}/20`);
