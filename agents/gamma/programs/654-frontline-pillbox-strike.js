// programs/654-frontline-pillbox-strike.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 654: FRONTLINE PILLBOX STRIKE ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain golden boots and shield
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

// 2. Step to exact frontline firing slit (36.0, 66.0, -186.5)
console.log('Moving to frontline firing slit at (36.0, 66.0, -186.5)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(36.0, 66.0, -186.5, 0.3));
} catch (e) {
  console.log('Pathfind to slit notice:', e.message);
}

let startRods = lib.count('blaze_rod');
console.log(`Current Blaze Rods held: ${startRods}/8, HP: ${bot.health}`);
bot.chat(`gamma: Frontline firing slit active! Rods held: ${startRods}/8. Striking Blazes!`);

let lastAttack = 0;
let kills = 0;
let hits = 0;
const combatStart = Date.now();
const COMBAT_DURATION = 90000; // 90 seconds

while (Date.now() - combatStart < COMBAT_DURATION && !isCancelled()) {
  if (bot.health <= 6) {
    bot.activateItem(true);
    await sleep(500);
    continue;
  }

  // Ensure shield is in offhand
  if (bot.inventory.slots[45]?.name !== 'shield') {
    const sh = bot.inventory.items().find(i => i.name === 'shield');
    if (sh) await bot.equip(sh, 'off-hand');
  }

  // Find all blazes
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

    // If within strike range (<= 5.2m)
    if (dist <= 5.2 && Date.now() - lastAttack > 620) {
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
      bot.activateItem(true);
    }
  } else {
    // Face spawner at (32, 68, -190)
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Vacuum ground items (Blaze Rods!)
  const groundItems = Object.values(bot.entities).filter(e =>
    e.name === 'item' && e.isValid &&
    bot.entity.position.distanceTo(e.position) <= 4.5 &&
    e.position.x >= 34.0
  );

  for (const item of groundItems) {
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
    bot.chat(`gamma: 8 BLAZE RODS SECURED (${curRods}/8)! Milestone 8 100% COMPLETE! Retreating to Overworld Base!`);
    break;
  }

  await sleep(100);
}

bot.deactivateItem();
try { await lib.equipWeapon(); } catch (e) {}

const finalRods = lib.count('blaze_rod');
console.log(`=== END PROGRAM 654: Blaze Rods=${finalRods}/8, Kills=${kills}, Hits=${hits}, HP=${bot.health} ===`);

// If 8+ rods secured, retreat to Overworld base
if (finalRods >= 8) {
  console.log('8+ rods achieved! Retreating to Overworld Base...');
  try {
    await retreatToOverworldBase();
  } catch (err) {
    console.log('retreat notice:', err.message);
  }
}

return {
  hp: bot.health,
  food: bot.food,
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  blaze_rods: finalRods,
  kills,
  hits,
  inv: lib.inv()
};
