// programs/762-scoop-water-and-cast-portal.js
console.log('=== Program 762: Scoop Water Bucket & Cast Obsidian Portal ===');
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

// 2. Scoop water bucket from base water pool at (292, 71, -50)
if (lib.count('water_bucket') === 0 && lib.count('bucket') > 0) {
  console.log('Scooping water from base water source at (292, 71, -50)...');
  const wb = bot.findBlock({
    matching: b => b && b.name === 'water' && (b.getProperties()?.level === '0' || b.getProperties()?.level === 0 || b.metadata === 0),
    maxDistance: 16
  });

  if (wb) {
    console.log(`Found water source at ${lib.fmt(wb.position)}`);
    await bot.pathfinder.goto(new goals.GoalNear(wb.position.x, wb.position.y + 1, wb.position.z, 2.0));
    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) await bot.equip(bkt, 'hand');
    await bot.lookAt(wb.position.offset(0.5, 0.8, 0.5), true);
    await sleep(200);
    bot.activateItem();
    await sleep(800);
  } else {
    // Try lib.fillBucket('water')
    try {
      await lib.fillBucket('water');
    } catch (e) {
      console.log('fillBucket water note:', e.message);
    }
  }
}

const hasWater = lib.count('water_bucket') > 0;
console.log(`Water bucket status: ${hasWater ? 'READY' : 'EMPTY'}`);
bot.chat(`alpha: Water bucket ${hasWater ? 'READY' : 'EMPTY'}! Standing by at portal frame (299, 73, -52) ready to quench Beta's lava into obsidian!`);

// 3. Return to portal frame at (299, 73, -52)
console.log('Positioning at portal frame (299, 73, -52)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(299, 73, -52, 1.2));
} catch (e) {}

console.log('Alpha at portal frame:', lib.fmt(bot.entity.position));

// 4. Monitor sill at (299, 72, -54) and cast obsidian when lava is placed
const sillPos = new Vec3(299, 72, -54);
const startMonitor = Date.now();
let lit = false;

while (Date.now() - startMonitor < 60000 && !checkCancelled()) {
  // Check if portal is already lit
  let portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
  if (portals.length > 0) {
    console.log(`*** NETHER PORTAL IS ALREADY LIT! ${portals.length} active blocks! ***`);
    lit = true;
    break;
  }

  const sill = bot.blockAt(sillPos);
  const sillName = sill ? sill.name : 'null';

  // If lava is present in sill, quench it immediately!
  if (sillName === 'lava') {
    console.log('LAVA DETECTED IN SILL! Quenching with water...');
    bot.chat('alpha: Quenching lava with water to cast obsidian!');

    const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
    if (wb) {
      await bot.equip(wb, 'hand');
      // Pour water against (298, 73, -54)
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

  // If sill is obsidian, strike with flint & steel!
  const sillAfter = bot.blockAt(sillPos);
  if (sillAfter && sillAfter.name === 'obsidian') {
    console.log('OBSIDIAN SILL COMPLETE! Striking with flint_and_steel...');
    const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
    if (fas) {
      await bot.equip(fas, 'hand');
      await bot.activateBlock(sillAfter, new Vec3(0, 1, 0));
      await sleep(1000);
      portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
      if (portals.length > 0) {
        lit = true;
        break;
      }
    }
  }

  await sleep(1000);
}

// 5. Final check and warp into Nether!
const finalPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
if (finalPortals.length > 0) {
  bot.chat(`alpha: NETHER PORTAL ACTIVE (${finalPortals.length} blocks)! Milestone 7 100% RESTORED! Warping to Nether!`);
  console.log('Warping into Nether portal...');
  const res = await enterNetherPortal(20000);
  console.log('Warp result:', JSON.stringify(res));
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  portals: finalPortals.length,
  hasWater: lib.count('water_bucket') > 0,
  inv: lib.inv()
};
