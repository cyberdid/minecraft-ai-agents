// programs/652-pillbox-blaze-combat.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 652: PILLBOX BLAZE COMBAT & ROD HARVEST ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain active shield in offhand & golden boots on feet
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
const offhand = bot.inventory.slots[45];
if (!offhand || offhand.name !== 'shield') {
  const sh = bot.inventory.items().find(i => i.name === 'shield');
  if (sh) await bot.equip(sh, 'off-hand');
}

// Ensure weapon in hand
try { await lib.equipWeapon(); } catch (e) {}

// Raise shield immediately
bot.activateItem(true);

// 2. Inspect surrounding pillbox geometry
console.log('Scanning surrounding blocks in front of Pillbox...');
for (let dx = -3; dx <= 1; dx++) {
  for (let dz = -3; dz <= 1; dz++) {
    const p = bot.entity.position.offset(dx, -1, dz);
    const fl = bot.blockAt(p);
    const wall = bot.blockAt(p.offset(0, 1, 0));
    // console.log(`Floor at ${lib.fmt(p)}: ${fl ? fl.name : 'null'}, Wall at y+1: ${wall ? wall.name : 'null'}`);
  }
}

// Seal floor hole at (33, 65, -187) if air
const holePos = new Vec3(33, 65, -187);
const holeBlock = bot.blockAt(holePos);
if (holeBlock && (holeBlock.name === 'air' || holeBlock.name === 'cave_air')) {
  console.log('Floor hole detected at (33, 65, -187)! Sealing with cobblestone...');
  try {
    const cobble = bot.inventory.items().find(i => i.name === 'cobblestone');
    if (cobble) {
      await bot.equip(cobble, 'hand');
      const ref = bot.blockAt(new Vec3(34, 65, -187));
      if (ref) {
        await bot.placeBlock(ref, new Vec3(-1, 0, 0));
        console.log('Sealed floor hole at (33, 65, -187)!');
      }
    }
  } catch (e) {
    console.log('Could not seal hole:', e.message);
  }
}

// 3. Combat Loop with Active Shield
let startRods = lib.count('blaze_rod');
console.log(`Starting Blaze Rods: ${startRods}/8, HP: ${bot.health}`);
bot.chat(`gamma: Fighting Blazes at Spawner Pillbox! Current rods: ${startRods}/8.`);

let lastAttack = 0;
let kills = 0;
let hits = 0;
const combatStart = Date.now();
const COMBAT_DURATION = 90000; // 90 seconds

while (Date.now() - combatStart < COMBAT_DURATION && !isCancelled()) {
  // If health drops to critical, maintain shield facing blazes
  if (bot.health <= 7) {
    bot.activateItem(true);
    await sleep(500);
    continue;
  }

  // Ensure shield is in offhand
  if (bot.inventory.slots[45]?.name !== 'shield') {
    const sh = bot.inventory.items().find(i => i.name === 'shield');
    if (sh) await bot.equip(sh, 'off-hand');
  }

  // Lock position safely inside pillbox (36.5..37.5, 66.0, -186.5)
  if (bot.entity.position.distanceTo(new Vec3(37.0, 66.0, -186.5)) > 1.2) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(37.0, 66.0, -186.5, 0.4));
    } catch (e) {}
  }

  // Find blazes
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    // Face blaze to block fireballs with shield
    await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

    // If within strike range (<= 4.8m)
    if (dist <= 4.8 && Date.now() - lastAttack > 620) {
      bot.deactivateItem(); // Lower shield
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      bot.activateItem(true); // Re-raise shield immediately!
      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Blaze slain! Total kills: ${kills}`);
      }
    } else {
      bot.activateItem(true); // Keep shield up
    }
  } else {
    // Face blaze spawner at (32, 68, -190)
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Scan and vacuum ground items (Blaze Rods!) within reach
  const groundItems = Object.values(bot.entities).filter(e =>
    e.name === 'item' && e.isValid &&
    bot.entity.position.distanceTo(e.position) <= 4.0 &&
    e.position.x >= 34.5 // Do not step off into abyss
  );

  for (const item of groundItems) {
    // Check floor under item before stepping to it
    const floorUnder = bot.blockAt(item.position.offset(0, -0.5, 0));
    if (floorUnder && floorUnder.boundingBox === 'block') {
      try {
        await bot.pathfinder.goto(new goals.GoalNear(item.position.x, item.position.y, item.position.z, 0.5));
      } catch (e) {}
    }
  }

  const curRods = lib.count('blaze_rod');
  if (curRods > startRods) {
    console.log(`HARVESTED BLAZE ROD! Count: ${curRods}/8!`);
    bot.chat(`gamma: Harvested Blaze Rod! Total: ${curRods}/8!`);
    startRods = curRods;
  }

  if (curRods >= 8) {
    bot.chat(`gamma: 8 BLAZE RODS SECURED (${curRods}/8)! Milestone 8 100% COMPLETE!`);
    break;
  }

  await sleep(100);
}

bot.deactivateItem();
try { await lib.equipWeapon(); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log(`=== END PROGRAM 652: Blaze Rods=${finalRods}/8, Kills=${kills}, Hits=${hits}, HP=${bot.health} ===`);
return {
  hp: bot.health,
  food: bot.food,
  blaze_rods: finalRods,
  kills,
  hits,
  pos: bot.entity.position,
  inv: lib.inv()
};
