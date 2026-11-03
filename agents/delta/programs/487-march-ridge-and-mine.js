// programs/487-march-ridge-and-mine.js
globalThis.isProgramCancelled = isCancelled;
globalThis.isCancelled = isCancelled;

console.log('Delta starting Ridge advance from:', lib.fmt(bot.entity.position), 'HP:', bot.health);

// 1. Equip shield and sword
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

globalThis.configureFireAvoidance();

// Clear fire helper
const clearFire = async () => {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 4.5,
    count: 5
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
};

const RIDGE_WAYPOINTS = [
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 },
  { x: 62, y: 67, z: -50 },
  { x: 61.5, y: 67, z: -65 },
  { x: 62.0, y: 67, z: -80 }
];

const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
let mined = 0;

for (let i = 0; i < RIDGE_WAYPOINTS.length && !isCancelled(); i++) {
  const wp = RIDGE_WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) > 2.5) {
    console.log(`Walking to Ridge WP ${i + 1}/${RIDGE_WAYPOINTS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
    await clearFire();
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try { await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 7000 }); } catch (e2) {}
    }
  }

  // Scan for safe nether_gold_ore (y >= 64 only - high plateau!)
  if (goldOreId) {
    const ores = bot.findBlocks({
      matching: goldOreId,
      maxDistance: 12,
      count: 10
    }).map(p => bot.blockAt(p))
      .filter(b => b && b.position.y >= 64); // NEVER descend below plateau!

    console.log(`WP ${i + 1} at ${lib.fmt(bot.entity.position)}: found ${ores.length} safe plateau gold ores.`);
    for (const b of ores) {
      if (isCancelled()) break;
      const op = b.position;
      try {
        await bot.pathfinder.goto(new goals.GoalNear(op.x, op.y, op.z, 2.5));
        const block = bot.blockAt(op);
        if (block && block.name === 'nether_gold_ore') {
          await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
          console.log(`Mining safe nether_gold_ore at ${lib.fmt(op)}...`);
          await bot.dig(block);
          mined++;
          await sleep(200);
          try { await lib.pickup(3.5); } catch (e) {}
        }
      } catch (e) {}

      if (lib.count('gold_nugget') >= 36) break;
    }
  }

  // Craft ingots from nuggets
  if (lib.count('gold_nugget') >= 9) {
    const ingots = Math.floor(lib.count('gold_nugget') / 9);
    try { await lib.craft('gold_ingot', ingots); } catch (e) {}
  }

  // Craft golden_boots if 4+ ingots
  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    try {
      await lib.craft('golden_boots', 1);
      console.log('Crafted golden_boots!');
      const gb = bot.inventory.items().find(it => it.name === 'golden_boots');
      if (gb) {
        await bot.equip(gb, 'feet');
        bot.chat('delta: Equipped golden_boots! 100% Piglin neutrality ACTIVE!');
      }
    } catch (e) {}
  }

  // If Piglin nearby and wearing golden boots and holding gold ingot, barter!
  const hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
  if (hasBoots && lib.count('gold_ingot') > 0) {
    const piglins = Object.values(bot.entities).filter(e =>
      e.name === 'piglin' && e.isValid && bot.entity.position.distanceTo(e.position) <= 10
    );
    if (piglins.length > 0) {
      const piglin = piglins[0];
      await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);
      const ingot = bot.inventory.items().find(it => it.name === 'gold_ingot');
      if (ingot) {
        console.log(`Tossing gold_ingot to Piglin at ${lib.fmt(piglin.position)} for barter...`);
        bot.chat('delta: Bartering gold ingot with neutral Piglin for Ender Pearls!');
        await bot.toss(ingot.type, null, 1);
        await sleep(7000);
        try { await lib.pickup(4.0); } catch (e) {}
      }
    }
  }

  if (lib.count('ender_pearl') >= 12) {
    bot.chat(`delta: Milestone 9 TARGET REACHED! ${lib.count('ender_pearl')} Ender Pearls secured!`);
    break;
  }
}

// Pickup remaining drops
try { await lib.pickup(4); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

const pearls = lib.count('ender_pearl');
console.log(`Ridge patrol finished. Mined: ${mined}, Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}, Boots: ${lib.count('golden_boots')}, Pearls: ${pearls}`);
bot.chat(`delta: Ridge gold patrol complete. Mined ${mined} ores. Ingots: ${lib.count('gold_ingot')}, Pearls: ${pearls}/12.`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  mined,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots'),
  pearls,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
