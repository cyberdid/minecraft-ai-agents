// programs/769-seal-basin-and-standby.js
console.log('=== Program 769: Seal Basin & Standby for Lava ===');
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

// 2. Walk to portal frame at (299, 73, -52)
console.log('Moving to portal frame (299, 73, -52)...');
await bot.pathfinder.goto(new goals.GoalNear(299, 73, -52, 1.0));
console.log('Alpha at portal frame:', lib.fmt(bot.entity.position));

// 3. Inspect basin blocks around (299, 72, -54)
const basinSurroundings = {
  bottom: bot.blockAt(new Vec3(299, 71, -54)),
  west: bot.blockAt(new Vec3(298, 72, -54)),
  east: bot.blockAt(new Vec3(300, 72, -54)),
  north: bot.blockAt(new Vec3(299, 72, -55)),
  south: bot.blockAt(new Vec3(299, 72, -53)),
  sill: bot.blockAt(new Vec3(299, 72, -54))
};

console.log('Basin surroundings:');
for (const [dir, b] of Object.entries(basinSurroundings)) {
  console.log(` - ${dir}: ${b ? b.name : 'null'} at ${lib.fmt(b ? b.position : {x:0,y:0,z:0})}`);
}

// 4. Seal south block at (299, 72, -53) if air
const south = bot.blockAt(new Vec3(299, 72, -53));
if (south && (south.name === 'air' || south.name === 'cave_air' || south.name === 'short_grass')) {
  console.log('Sealing South side of basin at (299, 72, -53) with cobblestone...');
  try {
    await lib.place('cobblestone', 299, 72, -53);
    console.log('South basin block placed!');
  } catch (e) {
    console.log('Place south block note:', e.message);
  }
}

// 5. Chat team status
bot.chat('alpha: Basin sealed at (299, 72, -54)! I hold water_bucket & flint_and_steel! Standing by for Beta to bring lava from (286, 18, 8)!');

// 6. Monitor sill for lava or obsidian
const sillPos = new Vec3(299, 72, -54);
const startWait = Date.now();
let lit = false;

while (Date.now() - startWait < 55000 && !checkCancelled()) {
  let portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
  if (portals.length > 0) {
    console.log(`*** NETHER PORTAL IS ALREADY ACTIVE! ${portals.length} blocks! ***`);
    lit = true;
    break;
  }

  const curSill = bot.blockAt(sillPos);
  const sillName = curSill ? curSill.name : 'null';

  // If lava placed in sill, quench immediately!
  if (sillName === 'lava') {
    console.log('LAVA DETECTED IN SILL! Quenching with water...');
    bot.chat('alpha: Quenching lava into obsidian!');
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

  // If sill is obsidian, strike with flint & steel!
  const sillNow = bot.blockAt(sillPos);
  if (sillNow && sillNow.name === 'obsidian') {
    console.log('OBSIDIAN SILL COMPLETE! Striking with flint_and_steel...');
    const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
    if (fas) {
      await bot.equip(fas, 'hand');
      await bot.activateBlock(sillNow, new Vec3(0, 1, 0));
      await sleep(1000);
      portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
      if (portals.length > 0) {
        lit = true;
        break;
      }
    }
  }

  await sleep(1500);
}

// 7. If portal is lit, warp into Nether!
const finalPortals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
if (finalPortals.length > 0) {
  bot.chat(`alpha: NETHER PORTAL ACTIVE! Milestone 7 RESTORED! Entering Nether!`);
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
