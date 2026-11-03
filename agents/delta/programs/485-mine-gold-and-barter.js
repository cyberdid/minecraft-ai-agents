// programs/485-mine-gold-and-barter.js
globalThis.isProgramCancelled = isCancelled;
globalThis.isCancelled = isCancelled;

console.log('Delta starting gold mining and bartering at:', lib.fmt(bot.entity.position));

// 1. Equip shield in offhand and stone sword
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

globalThis.configureFireAvoidance();

// 2. Clear any fire ahead
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
await clearFire();

// 3. Waypoints along East Ridge
const WAYPOINTS = [
  { x: 46, y: 65, z: -7 },
  { x: 54, y: 65, z: -7 },
  { x: 63, y: 64, z: -7 },
  { x: 63, y: 65, z: -20 },
  { x: 63, y: 66, z: -35 }
];

const goldOreId = mcData.blocksByName.nether_gold_ore?.id;
let totalMined = 0;

for (let i = 0; i < WAYPOINTS.length && !isCancelled(); i++) {
  const wp = WAYPOINTS[i];
  const target = new Vec3(wp.x, wp.y, wp.z);
  if (bot.entity.position.distanceTo(target) > 2.5) {
    console.log(`Advancing to WP ${i + 1}/${WAYPOINTS.length} (${wp.x}, ${wp.y}, ${wp.z})...`);
    await clearFire();
    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      try { await lib.goTo(wp.x, wp.y, wp.z, 2, { dig: false, timeoutMs: 6000 }); } catch (e2) {}
    }
  }

  // Scan for nether_gold_ore
  if (goldOreId) {
    const ores = bot.findBlocks({
      matching: goldOreId,
      maxDistance: 10,
      count: 8
    });

    console.log(`WP ${i + 1} at ${lib.fmt(bot.entity.position)}: found ${ores.length} nether_gold_ore blocks.`);
    for (const orePos of ores) {
      if (isCancelled()) break;
      // Skip if directly over lava
      const below = bot.blockAt(orePos.offset(0, -1, 0));
      if (below && below.name === 'lava') continue;

      try {
        await bot.pathfinder.goto(new goals.GoalNear(orePos.x, orePos.y, orePos.z, 2.5));
        const block = bot.blockAt(orePos);
        if (block && block.name === 'nether_gold_ore') {
          await bot.equip(mcData.itemsByName.stone_pickaxe.id, 'hand');
          console.log(`Mining nether_gold_ore at ${lib.fmt(orePos)}...`);
          await bot.dig(block);
          totalMined++;
          await sleep(200);
          try { await lib.pickup(3.5); } catch (e) {}
        }
      } catch (e) {
        console.log(`Mining note at ${lib.fmt(orePos)}:`, e.message);
      }

      if (lib.count('gold_nugget') >= 36) break;
    }
  }

  // Check if we can craft golden_boots
  if (lib.count('gold_nugget') >= 9) {
    const ingots = Math.floor(lib.count('gold_nugget') / 9);
    try { await lib.craft('gold_ingot', ingots); } catch (e) {}
  }

  if (lib.count('gold_ingot') >= 4 && lib.count('golden_boots') === 0) {
    try {
      await lib.craft('golden_boots', 1);
      const gb = bot.inventory.items().find(it => it.name === 'golden_boots');
      if (gb) {
        await bot.equip(gb, 'feet');
        bot.chat('delta: Crafted & equipped golden_boots! 100% Piglin neutrality ACTIVE!');
      }
    } catch (e) {}
  }

  // If Delta has golden_boots equipped and surplus gold ingots, check for Piglins to barter!
  const hasGoldenBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
  if (hasGoldenBoots && lib.count('gold_ingot') > 0) {
    const piglins = Object.values(bot.entities).filter(e =>
      e.name === 'piglin' &&
      e.isValid &&
      bot.entity.position.distanceTo(e.position) <= 12
    );

    if (piglins.length > 0) {
      console.log(`Found ${piglins.length} Piglins nearby for bartering!`);
      const piglin = piglins[0];
      await bot.lookAt(piglin.position.offset(0, 1.2, 0), true);

      // Toss 1 gold ingot to the Piglin
      const ingot = bot.inventory.items().find(it => it.name === 'gold_ingot');
      if (ingot) {
        console.log(`Tossing gold_ingot to Piglin at ${lib.fmt(piglin.position)}...`);
        bot.chat('delta: Bartering gold ingot with Piglin for Ender Pearls!');
        await bot.toss(ingot.type, null, 1);
        // Piglin examines ingot for ~6 seconds then drops barter item
        console.log('Waiting 7s for Piglin barter drop...');
        await sleep(7000);
        try { await lib.pickup(4.0); } catch (e) {}
      }
    }
  }
}

// Pickup drops
try { await lib.pickup(4); } catch (e) {}

// Final gear check
try { await lib.equipWeapon(); } catch (e) {}
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

const pearls = lib.count('ender_pearl');
console.log(`Round complete. Mined: ${totalMined}, Nuggets: ${lib.count('gold_nugget')}, Ingots: ${lib.count('gold_ingot')}, Boots: ${lib.count('golden_boots')}, Pearls: ${pearls}`);
bot.chat(`delta: Gold/barter round complete. Mined: ${totalMined} ores. Ingots: ${lib.count('gold_ingot')}, Golden Boots: ${lib.count('golden_boots')}, Ender Pearls: ${pearls}/12.`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  mined: totalMined,
  nuggets: lib.count('gold_nugget'),
  ingots: lib.count('gold_ingot'),
  boots: lib.count('golden_boots'),
  pearls,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
