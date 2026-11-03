// programs/783-cast-obsidian-ignite-and-warp.js
console.log('=== Program 783: Cast Obsidian, Ignite & Warp to Nether ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// 2. Lock position directly in front of sill at (299.5, 73.0, -52.0)
await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -52.0, 0.6));
console.log('Locked at portal frame:', lib.fmt(bot.entity.position));

bot.chat('alpha: Beta holds lava_bucket! I am locked at (299, 73, -52) with water_bucket & flint_and_steel! Quenching & igniting the moment it lands!');

const sillPos = new Vec3(299, 72, -54);
const startWait = Date.now();
let activePortals = 0;

while (Date.now() - startWait < 85000 && !checkCancelled()) {
  let portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
  if (portals.length > 0) {
    console.log(`*** NETHER PORTAL IS ACTIVE! ${portals.length} blocks! ***`);
    activePortals = portals.length;
    break;
  }

  const sill = bot.blockAt(sillPos);
  const sillName = sill ? sill.name : 'null';

  if (Math.round((Date.now() - startWait) / 1000) % 5 === 0) {
    const beta = bot.players['beta']?.entity;
    console.log(`[Cast-Watch ${Math.round((Date.now() - startWait) / 1000)}s] Sill: ${sillName}, Beta at: ${beta ? lib.fmt(beta.position) : 'shaft'}`);
  }

  // Action 1: Lava placed in sill -> Quench immediately with water bucket!
  if (sillName === 'lava') {
    console.log('*** LAVA DETECTED IN SILL! Quenching with water bucket! ***');
    bot.chat('alpha: Quenching lava with water into obsidian!');
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

  // Action 2: Obsidian in sill -> Strike with flint_and_steel!
  const sillAfter = bot.blockAt(sillPos);
  if (sillAfter && sillAfter.name === 'obsidian') {
    console.log('*** OBSIDIAN SILL COMPLETE! Striking with flint_and_steel! ***');
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

  await sleep(250);
}

// 3. Final verification and warp into Nether!
const finalPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
console.log(`Final active nether_portal blocks: ${finalPortals.length}`);

if (finalPortals.length > 0) {
  bot.chat(`alpha: NETHER PORTAL ACTIVE (${finalPortals.length} blocks)! Milestone 7 100% RESTORED! Stepping into portal!`);
  console.log('Entering Nether Portal...');
  const res = await enterNetherPortal(25000);
  console.log('Portal transit result:', JSON.stringify(res));
  if (bot.game.dimension === 'the_nether') {
    bot.chat('alpha: In the Nether! Advancing to Fortress Bunker for Milestone 9!');
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  portals: finalPortals.length,
  inv: lib.inv()
};
