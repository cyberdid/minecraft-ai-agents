// programs/777-hunt-food-and-portal-vigil.js
console.log('=== Program 777: Hunt Food & Portal Vigil ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield and iron sword
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// 2. Step outside base door
console.log('Stepping outside base door (294, 72, -54)...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await lib.goTo(294, 72, -53, 1.0, { timeoutMs: 4000 });
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Outside base at:', lib.fmt(bot.entity.position));

// 3. Hunt 1 animal if food <= 6
if (bot.food <= 8) {
  const animals = Object.values(bot.entities).filter(e =>
    e.position && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
    e.position.distanceTo(bot.entity.position) < 32
  );
  console.log(`Animals nearby (${animals.length}):`, animals.map(a => `${a.name} at ${lib.fmt(a.position)}`));
  if (animals.length > 0) {
    const target = animals[0];
    console.log(`Hunting ${target.name} for food...`);
    try {
      await lib.hunt(target.name, 1);
      await sleep(400);
      await lib.eat();
    } catch (e) {
      console.log('Hunt note:', e.message);
    }
  }
}

// 4. Position at portal frame (299.5, 73.0, -52.0)
await bot.pathfinder.goto(new goals.GoalNear(299.5, 73.0, -52.0, 0.6));
console.log('At portal frame:', lib.fmt(bot.entity.position));

bot.chat('alpha: Stationed at portal frame (299, 73, -52) with water_bucket & flint_and_steel! Beta, bring lava to sill (299, 72, -54)!');

// 5. Monitor Beta and sill
const sillPos = new Vec3(299, 72, -54);
const startWait = Date.now();
let lit = false;

while (Date.now() - startWait < 60000 && !checkCancelled()) {
  let portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
  if (portals.length > 0) {
    console.log(`*** NETHER PORTAL IS ACTIVE! ${portals.length} blocks! ***`);
    lit = true;
    break;
  }

  const sill = bot.blockAt(sillPos);
  const sillName = sill ? sill.name : 'null';

  if (Math.round((Date.now() - startWait) / 1000) % 5 === 0) {
    const beta = bot.players['beta']?.entity;
    console.log(`[Vigil ${Math.round((Date.now() - startWait) / 1000)}s] Sill: ${sillName}, Beta at: ${beta ? lib.fmt(beta.position) : 'in shaft'}`);
  }

  // Quench lava if placed!
  if (sillName === 'lava') {
    console.log('*** LAVA DETECTED IN SILL! Quenching with water... ***');
    bot.chat('alpha: Quenching lava with water to cast obsidian!');
    const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
    if (wb) {
      await bot.equip(wb, 'hand');
      await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
      bot.activateItem();
      await sleep(1500);

      const bkt = bot.inventory.items().find(i => i.name === 'bucket');
      if (bkt) await bot.equip(bkt, 'hand');
      await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
      bot.activateItem();
      await sleep(800);
    }
  }

  // Strike with flint & steel if obsidian!
  const sillAfter = bot.blockAt(sillPos);
  if (sillAfter && sillAfter.name === 'obsidian') {
    console.log('*** OBSIDIAN SILL COMPLETE! Striking with flint_and_steel! ***');
    const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
    if (fas) {
      await bot.equip(fas, 'hand');
      await bot.activateBlock(sillAfter, new Vec3(0, 1, 0));
      await sleep(1200);
      portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
      if (portals.length > 0) {
        lit = true;
        break;
      }
    }
  }

  await sleep(400);
}

// 6. Enter portal if active
const finalPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
if (finalPortals.length > 0) {
  bot.chat(`alpha: NETHER PORTAL ACTIVE! Milestone 7 RESTORED! Stepping into portal!`);
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
