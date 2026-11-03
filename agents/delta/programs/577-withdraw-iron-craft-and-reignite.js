// programs/577-withdraw-iron-craft-and-reignite.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== DELTA: WITHDRAW SMELTED IRON, CRAFT SHIELD & IGNITE ===');
console.log(`Starting pos: ${lib.fmt(bot.entity.position)}, HP: ${bot.health}`);

// Step 1: Wait 12 seconds for at least 2-3 iron ingots to smelt
console.log('Waiting for furnace to smelt iron...');
await sleep(12000);

const fb = bot.blockAt(new Vec3(295, 72, -55));
if (fb) {
  try {
    const f = await bot.openFurnace(fb);
    const out = f.outputItem();
    console.log(`Furnace output: ${out ? out.name + ' x' + out.count : 'empty'}`);
    if (out && out.name === 'iron_ingot') {
      console.log(`Withdrawing ${out.count} iron ingots!`);
      await f.takeOutput();
    }
    f.close();
  } catch (e) {
    console.log('Furnace error:', e.message);
  }
}

console.log(`Iron ingots held: ${lib.count('iron_ingot')}, Flint: ${lib.count('flint')}, Planks: ${lib.count('*_planks')}`);

// Step 2: Craft shield
if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
  try {
    console.log('Crafting shield at base crafting table (295, 72, -56)...');
    await lib.craft('shield', 1);
    console.log('SHIELD CRAFTED!');
    const s = bot.inventory.items().find(i => i.name === 'shield');
    if (s) {
      await bot.equip(s, 'off-hand');
      console.log('Shield equipped in offhand!');
    }
  } catch (e) {
    console.log('Shield craft notice:', e.message);
  }
}

// Step 3: Craft flint_and_steel
if (lib.count('flint_and_steel') === 0 && lib.count('flint') >= 1 && lib.count('iron_ingot') >= 1) {
  try {
    console.log('Crafting flint_and_steel...');
    await lib.craft('flint_and_steel', 1);
    console.log('FLINT AND STEEL CRAFTED!');
    bot.chat('delta: Crafted flint_and_steel! Standing by at portal frame to ignite!');
  } catch (e) {
    console.log('Flint and steel craft notice:', e.message);
  }
}

// Step 4: Check portal sill at (299, 72, -54)
const sill = bot.blockAt(new Vec3(299, 72, -54));
console.log(`Portal sill block at (299, 72, -54): ${sill ? sill.name : 'null'}`);

// If sill is obsidian and portal is not lit, ignite it!
let portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
if (!portal && sill && sill.name === 'obsidian' && lib.count('flint_and_steel') > 0) {
  console.log('Obsidian is set! Igniting portal with flint_and_steel at (299, 73, -54)...');
  try {
    await lib.ignite(299, 72, -54);
    await sleep(500);
    portal = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 8 });
    if (portal) {
      bot.chat('delta: NETHER PORTAL REIGNITED AND ACTIVE!');
    }
  } catch (err) {
    console.log('Ignite attempt:', err.message);
  }
}

console.log(`Portal active status: ${!!portal}`);

// Step 5: If portal is active, step inside and warp to Nether!
if (portal) {
  bot.chat('delta: Stepping into active Nether portal! Warping to the_nether!');
  const pPos = portal.position.offset(0.5, 0, 0.5);
  await bot.lookAt(pPos, true);
  try {
    await bot.pathfinder.goto(new goals.GoalBlock(portal.position.x, portal.position.y, portal.position.z));
  } catch (e) {
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 20000 && !isCancelled()) {
    await sleep(400);
  }

  console.log(`Dimension after warp: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);
}

return {
  portalActive: !!portal,
  iron_ingot: lib.count('iron_ingot'),
  shield: lib.count('shield'),
  flint_and_steel: lib.count('flint_and_steel'),
  dimension: bot.game.dimension,
  pos: bot.entity.position
};
