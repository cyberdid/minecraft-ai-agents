// programs/218-item-recovery.js
console.log('=== Program 218: Emergency Item Recovery at (303.5, -37.0, -109.7) ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('beta: Recovering diamond pickaxe and bucket at (303, -37, -110), deadline 16:46!');

// 1. Grab materials from base chest to craft quick stone pickaxe & shovel
const chestPos = new Vec3(293, 72, -57);
try {
  await lib.withdraw({ cobblestone: 6, oak_planks: 4 }, chestPos.x, chestPos.y, chestPos.z);
} catch (e) {
  // If oak_planks not in chest, check birch_planks or craft
  try {
    const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
    console.log('Chest contents on respawn:', JSON.stringify(contents));
  } catch (e2) {}
}

// Craft stone pickaxe and shovel if possible
try {
  if (lib.count('*_planks') > 0 && lib.count('stick') < 4) {
    const p = Object.keys(lib.inv()).find(k => k.endsWith('_planks'));
    if (p) await lib.craft('stick', 4);
  }
  if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    await lib.craft('stone_pickaxe', 1);
  }
  if (lib.count('cobblestone') >= 1 && lib.count('stick') >= 2) {
    await lib.craft('stone_shovel', 1);
  }
} catch (err) {
  console.log('Craft rescue tool error:', err.message);
}

console.log('Rescue inventory:', JSON.stringify(lib.inv()));

// 2. Step outside base
console.log('Leaving base...');
try {
  if (typeof passDoorOut === 'function') await passDoorOut();
  else await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Door exit error:', e.message);
}

// 3. Navigate down the staircase towards (303.5, -37.0, -109.7)
const waypoints = [
  { x: 345, y: 65, z: -40 },
  { x: 335, y: 50, z: -48 },
  { x: 325, y: 31, z: -55 },
  { x: 313, y: 14, z: -58 },
  { x: 303, y: 0, z: -69 },
  { x: 303, y: -20, z: -90 },
  { x: 303, y: -36, z: -108 }
];

for (let i = 0; i < waypoints.length; i++) {
  if (isCancelled()) break;
  const wp = waypoints[i];
  console.log(`Heading to waypoint ${i + 1}/${waypoints.length}: (${wp.x}, ${wp.y}, ${wp.z})...`);
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: true, timeoutMs: 25000 });
    console.log(`Reached wp ${i + 1}! Pos:`, lib.fmt(bot.entity.position));
  } catch (e) {
    console.log(`Wp ${i + 1} note:`, e.message);
  }
}

// 4. At death spot: clear suffocating blocks and pickup items
console.log('At death site area. Digging clear and picking up items...');
const target = new Vec3(303.5, -37.0, -109.7);
try {
  await lib.goTo(target.x, target.y + 1, target.z, 2, { dig: true, timeoutMs: 25000 });
} catch (e) {
  console.log('Final goTo note:', e.message);
}

// Pickup items
const gained = await lib.pickup(12);
console.log(`Picked up ${gained} items!`);

// Check if items are buried under gravel/sand
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 2; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      const p = target.offset(dx, dy, dz).floored();
      const b = bot.blockAt(p);
      if (b && (b.name === 'gravel' || b.name === 'sand' || b.name === 'dirt')) {
        console.log(`Clearing ${b.name} at ${lib.fmt(p)}...`);
        try {
          await lib.dig(p.x, p.y, p.z);
        } catch (e) {}
      }
    }
  }
}

await sleep(500);
await lib.pickup(12);

console.log('Inventory after recovery:', JSON.stringify(lib.inv()));
bot.chat(`beta: Recovery result: diamond_pickaxe=${lib.count('diamond_pickaxe')}, water_bucket=${lib.count('water_bucket')}. Pos: ${lib.fmt(bot.entity.position)}`);
