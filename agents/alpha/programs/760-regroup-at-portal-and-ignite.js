// programs/760-regroup-at-portal-and-ignite.js
console.log('=== Program 760: Regroup at Portal Frame & Ignite with Team ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

// 2. Sprint back to portal frame at (299, 73, -52)
console.log('Returning to base portal frame (299, 73, -52)...');
bot.chat('alpha: Sprinting to portal frame (299, 73, -52) to assist Beta with casting and ignite with flint & steel!');

try {
  await lib.goTo(299, 73, -52, 1.5, { timeoutMs: 25000 });
} catch (err) {
  console.log('Direct goTo failed, using pathfinder with fallback...');
  try {
    await bot.pathfinder.goto(new goals.GoalNear(299, 73, -52, 1.8));
  } catch (e) {
    // If underground, ascend
    await lib.goTo(302, 71, -44, 2.0, { timeoutMs: 15000 }).catch(() => {});
    await lib.goTo(299, 73, -52, 1.5, { timeoutMs: 15000 }).catch(() => {});
  }
}

console.log('Arrived at portal frame area:', lib.fmt(bot.entity.position));

// 3. Monitor portal frame and assist casting / ignition
const portalOpening = [
  new Vec3(299, 73, -54),
  new Vec3(300, 73, -54),
  new Vec3(299, 74, -54),
  new Vec3(300, 74, -54),
  new Vec3(299, 75, -54),
  new Vec3(300, 75, -54)
];

const sillPos = new Vec3(299, 72, -54);
const startMonitor = Date.now();
let lit = false;

while (Date.now() - startMonitor < 50000 && !checkCancelled()) {
  // Check active portal blocks
  const portals = bot.findBlocks({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 8,
    count: 6
  });

  if (portals.length > 0) {
    console.log(`*** NETHER PORTAL IS LIT! ${portals.length} active portal blocks detected! ***`);
    lit = true;
    break;
  }

  const sillBlock = bot.blockAt(sillPos);
  const sillName = sillBlock ? sillBlock.name : 'null';
  console.log(`[Monitor ${Math.round((Date.now() - startMonitor) / 1000)}s] Sill at (299, 72, -54): ${sillName}`);

  // Case A: Sill is obsidian! Ignite immediately!
  if (sillName === 'obsidian') {
    console.log('Obsidian verified in sill! Striking with flint_and_steel...');
    const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
    if (fas) {
      await bot.equip(fas, 'hand');
      await bot.activateBlock(sillBlock, new Vec3(0, 1, 0));
      await sleep(1000);
      const afterStrike = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
      if (afterStrike.length > 0) {
        lit = true;
        break;
      }
    }
  }

  // Case B: Sill has lava! If water is not yet poured, Alpha quenches it
  if (sillName === 'lava') {
    console.log('Lava detected in sill! Quenching with water...');
    // Ensure water bucket
    if (lib.count('water_bucket') === 0 && lib.count('bucket') > 0) {
      const wb = bot.findBlock({ matching: b => b && b.name === 'water' && b.metadata === 0, maxDistance: 16 });
      if (wb) {
        await bot.pathfinder.goto(new goals.GoalNear(wb.position.x, wb.position.y + 1, wb.position.z, 2.0));
        const bkt = bot.inventory.items().find(i => i.name === 'bucket');
        if (bkt) await bot.equip(bkt, 'hand');
        await bot.lookAt(wb.position.offset(0.5, 0.5, 0.5), true);
        bot.activateItem();
        await sleep(800);
        await bot.pathfinder.goto(new goals.GoalNear(299, 73, -52, 1.2));
      }
    }

    if (lib.count('water_bucket') > 0) {
      const wbItem = bot.inventory.items().find(i => i.name === 'water_bucket');
      await bot.equip(wbItem, 'hand');
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

  // Case C: Sill is air, check if Beta is near or placing
  await sleep(1500);
}

// 4. Final verification and warp into Nether!
const finalPortals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 8,
  count: 6
});

if (finalPortals.length > 0) {
  bot.chat(`alpha: NETHER PORTAL 100% OPERATIONAL! ${finalPortals.length} active portal blocks! Milestone 7 RESTORED!`);
  console.log('*** Entering Nether Portal now! ***');
  const transit = await enterNetherPortal(20000);
  console.log('Portal transit result:', JSON.stringify(transit));
} else {
  // If still unlit but obsidian is present, make one final strike attempt
  const curSill = bot.blockAt(sillPos);
  if (curSill && curSill.name === 'obsidian') {
    const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
    if (fas) {
      await bot.equip(fas, 'hand');
      await bot.activateBlock(curSill, new Vec3(0, 1, 0));
      await sleep(1000);
    }
  }
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  portals: bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 }).length,
  inv: lib.inv()
};
