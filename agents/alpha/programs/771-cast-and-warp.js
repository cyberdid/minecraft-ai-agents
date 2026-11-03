// programs/771-cast-and-warp.js
console.log('=== Program 771: Cast Obsidian Sill & Warp to Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'food:', bot.food, 'HP:', bot.health);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// 2. Position securely right in front of portal opening at (299.5, 73.0, -52.0)
await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -52.0, 0.8));
console.log('Alpha locked at portal frame:', lib.fmt(bot.entity.position));

bot.chat('alpha: Holding water_bucket & flint_and_steel at (299, 73, -52)! Beta is scooping lava at y=19. Ready to quench & ignite!');

const sillPos = new Vec3(299, 72, -54);
const startLoop = Date.now();
let activePortals = 0;

while (Date.now() - startLoop < 80000 && !checkCancelled()) {
  // Check if portal is already lit
  const portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
  if (portals.length > 0) {
    console.log(`*** NETHER PORTAL IS ACTIVE! ${portals.length} blocks! ***`);
    activePortals = portals.length;
    break;
  }

  const sill = bot.blockAt(sillPos);
  const sillName = sill ? sill.name : 'null';

  // Action A: Lava detected in sill -> Quench immediately with water bucket!
  if (sillName === 'lava') {
    console.log('*** LAVA DETECTED IN SILL! Quenching with water bucket! ***');
    bot.chat('alpha: Quenching lava with water to cast obsidian!');
    const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
    if (wb) {
      await bot.equip(wb, 'hand');
      await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
      bot.activateItem();
      await sleep(1500); // Wait for water to convert lava to obsidian

      // Scoop water back up
      const bkt = bot.inventory.items().find(i => i.name === 'bucket');
      if (bkt) await bot.equip(bkt, 'hand');
      await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
      bot.activateItem();
      await sleep(800);
    }
  }

  // Action B: Obsidian in sill -> Strike with flint_and_steel!
  const sillAfter = bot.blockAt(sillPos);
  if (sillAfter && sillAfter.name === 'obsidian') {
    console.log('*** OBSIDIAN SILL COMPLETE! Igniting portal frame with flint_and_steel! ***');
    const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
    if (fas) {
      await bot.equip(fas, 'hand');
      await bot.activateBlock(sillAfter, new Vec3(0, 1, 0));
      await sleep(1200);

      const checkP = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
      if (checkP.length > 0) {
        console.log(`*** PORTAL IGNITED! ${checkP.length} blocks! ***`);
        activePortals = checkP.length;
        break;
      }
    }
  }

  await sleep(600);
}

// 3. Once portal is active, enter portal and warp into the Nether!
if (activePortals > 0 || bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 }).length > 0) {
  bot.chat('alpha: NETHER PORTAL ACTIVE! Milestone 7 RESTORED! Stepping into portal to advance to Nether!');
  console.log('Stepping into Nether portal via enterNetherPortal()...');
  const transit = await enterNetherPortal(25000);
  console.log('Portal transit result:', JSON.stringify(transit));
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  portals: bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 }).length,
  inv: lib.inv()
};
