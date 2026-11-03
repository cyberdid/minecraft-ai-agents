// programs/765-meet-beta-and-cast-portal.js
console.log('=== Program 765: Hunt Food, Meet Beta & Complete Portal ===');
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

// 2. Step outside base door to surface
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

// 3. Quick food replenishment if animals nearby
if (bot.food < 10) {
  const animals = Object.values(bot.entities).filter(e =>
    e.position && ['cow', 'pig', 'sheep', 'chicken'].includes(e.name) &&
    e.position.distanceTo(bot.entity.position) < 24
  );
  console.log(`Animals nearby (${animals.length}):`, animals.map(a => `${a.name} at ${lib.fmt(a.position)}`));
  if (animals.length > 0) {
    const targetAnimal = animals[0];
    console.log(`Hunting ${targetAnimal.name} for food...`);
    try {
      await lib.hunt(targetAnimal.name, 1);
      await sleep(500);
      await lib.eat();
    } catch (e) {
      console.log('Hunt note:', e.message);
    }
  }
}

// 4. Move to portal frame at (299, 73, -52)
console.log('Positioning at portal frame (299, 73, -52)...');
await bot.pathfinder.goto(new goals.GoalNear(299, 73, -52, 1.2));
console.log('At portal frame:', lib.fmt(bot.entity.position));

// 5. Check Beta and Delta
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} holding: ${p.entity.heldItem?.name}`);
  }
}

bot.chat('alpha: Standing by at portal frame (299, 73, -52) with water_bucket and flint_and_steel! Beta/Delta, place lava at (299, 72, -54) and I will quench & ignite!');

// 6. Monitor sill at (299, 72, -54) for lava or obsidian
const sillPos = new Vec3(299, 72, -54);
const startMonitor = Date.now();
let lit = false;

while (Date.now() - startMonitor < 45000 && !checkCancelled()) {
  let portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
  if (portals.length > 0) {
    console.log(`*** NETHER PORTAL IS ACTIVE! ${portals.length} blocks! ***`);
    lit = true;
    break;
  }

  const sill = bot.blockAt(sillPos);
  const sillName = sill ? sill.name : 'null';

  if (sillName === 'lava') {
    console.log('LAVA IN SILL! Quenching with water...');
    bot.chat('alpha: Quenching lava with water to cast obsidian!');
    const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
    if (wb) {
      await bot.equip(wb, 'hand');
      await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
      bot.activateItem();
      await sleep(1500);

      // Scoop water back up
      const bkt = bot.inventory.items().find(i => i.name === 'bucket');
      if (bkt) await bot.equip(bkt, 'hand');
      await bot.lookAt(new Vec3(298.5, 73.5, -54.0), true);
      bot.activateItem();
      await sleep(800);
    }
  }

  const sillAfter = bot.blockAt(sillPos);
  if (sillAfter && sillAfter.name === 'obsidian') {
    console.log('OBSIDIAN SILL COMPLETE! Striking with flint_and_steel...');
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

  await sleep(1200);
}

// 7. If portal is lit, warp into Nether!
const finalPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
if (finalPortals.length > 0) {
  bot.chat(`alpha: NETHER PORTAL ACTIVE! Milestone 7 100% RESTORED! Entering Nether!`);
  const res = await enterNetherPortal(20000);
  console.log('Portal transit result:', JSON.stringify(res));
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  portals: finalPortals.length,
  inv: lib.inv()
};
