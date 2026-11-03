// programs/750-repair-and-ignite-portal.js
console.log('=== Program 750: Ascend, Inspect, Cast Obsidian & Reignite Portal ===');
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

// 2. Ascend mine shaft to base if underground
if (bot.entity.position.y < 70) {
  console.log(`Currently at y=${bot.entity.position.y.toFixed(1)}, ascending to surface/base...`);
  try {
    await lib.goTo(295, 72, -55, 2.0, { timeoutMs: 25000 });
  } catch (err) {
    console.log('Direct goTo to base failed, trying waypoints up shaft...');
    const ascentWps = [
      new Vec3(302, 53, -54),
      new Vec3(302, 60, -50),
      new Vec3(302, 66, -46),
      new Vec3(302, 71, -44),
      new Vec3(295, 72, -55)
    ];
    for (const wp of ascentWps) {
      if (checkCancelled()) break;
      if (bot.entity.position.distanceTo(wp) < 2.0) continue;
      try {
        await lib.goTo(wp.x, wp.y, wp.z, 1.8, { timeoutMs: 8000 });
      } catch (e) {
        try {
          await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0));
        } catch (e2) {}
      }
    }
  }
}

console.log('Position after ascent:', lib.fmt(bot.entity.position));

// 3. Inspect portal frame
console.log('Inspecting Nether portal frame at (298..301, 72..76, -54)...');
const frameStatus = {};
for (let y = 76; y >= 72; y--) {
  let row = `y=${y}: `;
  for (let x = 298; x <= 301; x++) {
    const b = bot.blockAt(new Vec3(x, y, -54));
    const name = b ? b.name : 'null';
    frameStatus[`${x},${y}`] = name;
    row += `[${x}:${name}] `;
  }
  console.log(row);
}

// Check active portal blocks
let portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
console.log(`Active nether_portal blocks found: ${portals.length}`);

// 4. If already lit, we are done with repair!
if (portals.length === 0) {
  // Check if missing sill block at (299, 72, -54)
  const sill = bot.blockAt(new Vec3(299, 72, -54));
  console.log(`Current block at sill (299, 72, -54): ${sill?.name}`);

  // Check Base Chest at (293, 72, -57) for obsidian or diamond pickaxe
  let foundObsidianInChest = false;
  try {
    const cb = bot.blockAt(new Vec3(293, 72, -57));
    if (cb) {
      await lib.goTo(294, 72, -57, 1.5, { timeoutMs: 5000 });
      const chest = await bot.openContainer(cb);
      const items = chest.containerItems();
      console.log('Chest items:', items.map(i => `${i.name}x${i.count}`).join(', '));
      const obsItem = items.find(i => i.name === 'obsidian');
      if (obsItem) {
        console.log(`Found ${obsItem.count} obsidian in chest! Withdrawing...`);
        await chest.withdraw(obsItem.type, null, 1);
        foundObsidianInChest = true;
      }
      chest.close();
    }
  } catch (e) {
    console.log('Chest inspect note:', e.message);
  }

  // If we have obsidian in inventory, just place it!
  if (lib.count('obsidian') > 0 && sill && (sill.name === 'air' || sill.name === 'cave_air')) {
    console.log('Placing obsidian from inventory into (299, 72, -54)...');
    await lib.goTo(299, 73, -52, 1.2, { timeoutMs: 6000 });
    await lib.place('obsidian', 299, 72, -54);
    console.log('Obsidian placed!');
  } else if (sill && sill.name !== 'obsidian') {
    // We need to cast obsidian with lava + water!
    console.log('Casting obsidian at (299, 72, -54) using lava bucket + water bucket...');
    bot.chat('alpha: Casting missing obsidian sill at (299, 72, -54) with lava and water!');

    // A. Ensure containment basin
    // Place cobblestone at (299, 72, -53) if open air
    const southBlock = bot.blockAt(new Vec3(299, 72, -53));
    if (southBlock && (southBlock.name === 'air' || southBlock.name === 'cave_air')) {
      console.log('Sealing South edge of basin at (299, 72, -53)...');
      try {
        await lib.goTo(299, 73, -52, 1.5, { timeoutMs: 5000 });
        await lib.place('cobblestone', 299, 72, -53);
      } catch (e) {
        console.log('South basin placement note:', e.message);
      }
    }

    // B. Obtain lava bucket if needed
    if (lib.count('lava_bucket') === 0) {
      console.log('Need lava bucket. Sourcing from surface lava pool at (333, 62, -78)...');
      try {
        await lib.goTo(333, 63, -76, 2.0, { timeoutMs: 20000 });
      } catch (e) {
        try { await bot.pathfinder.goto(new goals.GoalNear(333, 63, -76, 2.5)); } catch (e2) {}
      }
      console.log('At lava pool area:', lib.fmt(bot.entity.position));
      const lavaSrc = bot.findBlock({
        matching: b => b && b.name === 'lava' && b.metadata === 0,
        maxDistance: 6
      });
      if (lavaSrc) {
        console.log(`Scooping lava source at ${lib.fmt(lavaSrc.position)}...`);
        const bkt = bot.inventory.items().find(i => i.name === 'bucket');
        if (bkt) await bot.equip(bkt, 'hand');
        await bot.lookAt(lavaSrc.position.offset(0.5, 0.5, 0.5), true);
        bot.activateItem();
        await sleep(1000);
      }
      if (lib.count('lava_bucket') === 0) {
        throw new Error('Failed to scoop lava bucket at surface lava pool');
      }
      console.log('Lava bucket secured!');
    }

    // C. Return to portal frame and place lava into (299, 72, -54)
    console.log('Returning to portal frame with lava bucket...');
    await lib.goTo(299, 73, -52, 1.2, { timeoutMs: 15000 });
    const currentSill = bot.blockAt(new Vec3(299, 72, -54));
    if (currentSill && (currentSill.name === 'air' || currentSill.name === 'cave_air')) {
      console.log('Pouring lava into basin (299, 72, -54)...');
      const lb = bot.inventory.items().find(i => i.name === 'lava_bucket');
      if (lb) await bot.equip(lb, 'hand');
      await bot.lookAt(new Vec3(299.5, 71.9, -54.0), true);
      bot.activateItem();
      await sleep(1200);
    }
    console.log('Block at (299, 72, -54) after lava pour:', bot.blockAt(new Vec3(299, 72, -54))?.name);

    // D. Obtain water bucket if needed
    if (lib.count('water_bucket') === 0) {
      console.log('Scooping water bucket from base water pool at (292, 71, -50)...');
      const wb = bot.findBlock({
        matching: b => b && b.name === 'water' && b.metadata === 0,
        maxDistance: 16
      });
      if (wb) {
        await lib.goTo(wb.position.x, wb.position.y + 1, wb.position.z, 2.0, { timeoutMs: 8000 });
        const bkt = bot.inventory.items().find(i => i.name === 'bucket');
        if (bkt) await bot.equip(bkt, 'hand');
        await bot.lookAt(wb.position.offset(0.5, 0.5, 0.5), true);
        bot.activateItem();
        await sleep(1000);
      }
    }
    console.log('Water bucket status:', lib.count('water_bucket') > 0 ? 'READY' : 'MISSING');

    // E. Quench lava into obsidian
    if (lib.count('water_bucket') > 0) {
      console.log('Quenching lava with water at (299, 73, -54)...');
      await lib.goTo(299, 73, -52, 1.2, { timeoutMs: 8000 });
      const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
      if (wb) await bot.equip(wb, 'hand');
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

    // F. Remove temporary South containment cobblestone at (299, 72, -53) if placed
    const tempCobble = bot.blockAt(new Vec3(299, 72, -53));
    if (tempCobble && tempCobble.name === 'cobblestone') {
      try {
        await lib.dig(299, 72, -53);
      } catch (e) {}
    }
  }

  // 5. Verify obsidian at (299, 72, -54)
  const verifiedSill = bot.blockAt(new Vec3(299, 72, -54));
  console.log(`*** Final Sill at (299, 72, -54): ${verifiedSill?.name} ***`);

  // 6. Ignite portal frame with flint_and_steel!
  if (lib.count('flint_and_steel') > 0) {
    console.log('Striking portal frame with flint_and_steel...');
    const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
    await bot.equip(fas, 'hand');
    const targetBlock = bot.blockAt(new Vec3(299, 72, -54)) || bot.blockAt(new Vec3(300, 72, -54));
    if (targetBlock) {
      await bot.activateBlock(targetBlock, new Vec3(0, 1, 0));
      await sleep(1200);
    }
  }

  // Re-check portal blocks
  portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
  console.log(`Nether portal blocks after ignition: ${portals.length}`);
}

if (portals.length > 0) {
  bot.chat(`alpha: NETHER PORTAL ACTIVE! ${portals.length} portal blocks verified! Milestone 7 RESTORED!`);
  console.log('*** NETHER PORTAL IS FULLY ACTIVE AND LIT! ***');
} else {
  console.log('Portal not lit yet, attempting second strike at (300, 72, -54)...');
  const fas = bot.inventory.items().find(i => i.name === 'flint_and_steel');
  if (fas) {
    await bot.equip(fas, 'hand');
    const sill2 = bot.blockAt(new Vec3(300, 72, -54));
    if (sill2) {
      await bot.activateBlock(sill2, new Vec3(0, 1, 0));
      await sleep(1000);
    }
  }
}

// 7. If portal is lit, warp into Nether to join teammates for Milestone 9!
portals = bot.findBlocks({ matching: b => b && b.name === 'nether_portal', maxDistance: 8, count: 6 });
if (portals.length > 0) {
  console.log('Entering Nether Portal to advance to Nether Fortress Bunker...');
  bot.chat('alpha: Stepping into Nether portal! Advancing to Fortress Bunker for Milestone 9!');
  const res = await enterNetherPortal(20000);
  console.log('Portal transit result:', JSON.stringify(res));
}

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  portals: portals.length,
  inv: lib.inv()
};
