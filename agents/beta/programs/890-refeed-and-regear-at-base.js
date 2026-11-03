// programs/890-refeed-and-regear-at-base.js
console.log('=== Program 890: Emergency Re-feed & Supply at Base ===');
globalThis.isProgramCancelled = isCancelled;

const checkCancelled = () => (typeof isCancelled === 'function' ? isCancelled() : false);

bot.clearControlStates();
bot.pathfinder.stop();

console.log('Start pos:', lib.fmt(bot.entity.position), 'food:', bot.food, 'hp:', bot.health);

// 1. Walk to Nether Portal return frame (46.5, 66.0, 2.0)
const portalWps = [
  new Vec3(63, 64, -7),
  new Vec3(54, 65, -7),
  new Vec3(46, 65, -7),
  new Vec3(42, 65, 0)
];

for (const wp of portalWps) {
  if (checkCancelled()) break;
  try {
    await lib.goTo(wp.x, wp.y, wp.z, 2.0, { dig: false, timeoutMs: 6000 });
  } catch (e) {
    try { await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.0)); } catch (e2) {}
  }
}

// Locate nether_portal block and enter it
console.log('Entering Nether Portal to return to Overworld base...');
const portalBlock = bot.findBlock({ matching: b => b && b.name === 'nether_portal', maxDistance: 16 });
if (portalBlock) {
  await bot.lookAt(portalBlock.position.offset(0.5, 0.5, 0.5), true);
  bot.setControlState('forward', true);
  await sleep(1500);
  bot.setControlState('forward', false);

  const startWarp = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - startWarp < 25000 && !checkCancelled()) {
    await sleep(300);
  }
}

console.log(`Arrived in dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

if (bot.game.dimension === 'overworld') {
  // Walk into base shelter
  try {
    await lib.goThroughDoor(294, 72, -54);
  } catch (e) {
    try { await lib.goTo(294, 72, -55, 1.2, { timeoutMs: 5000 }); } catch (e2) {}
  }

  // Hunt food if needed
  if (bot.food < 14) {
    bot.chat('Beta: Low food (3/20). Hunting animals near base for food!');
    try {
      await lib.hunt('sheep', 2);
    } catch (e) {
      try { await lib.hunt('cow', 2); } catch (e2) {}
    }

    // Smelt raw meat in furnace
    const rawMeat = bot.inventory.items().find(i => i.name.startsWith('raw_') && !i.name.includes('iron') && !i.name.includes('copper') && !i.name.includes('gold'));
    if (rawMeat) {
      console.log(`Smelting ${rawMeat.name}...`);
      try {
        await lib.smelt(rawMeat.name, 'coal', rawMeat.count);
      } catch (err) {
        // Fallback: put in furnace manually
        const fb = bot.blockAt(new Vec3(295, 72, -55));
        if (fb) {
          const f = await bot.openFurnace(fb);
          await f.putInput(rawMeat.type, null, rawMeat.count);
          f.close();
        }
      }
    }

    // Eat any cooked food in inventory
    for (const item of bot.inventory.items()) {
      if (item.name.startsWith('cooked_') || item.name === 'bread' || item.name === 'apple') {
        console.log(`Eating ${item.name}...`);
        await bot.equip(item, 'hand');
        await bot.consume();
      }
    }
  }

  // Craft a shield if we have iron and wood
  if (lib.count('shield') === 0 && lib.count('iron_ingot') >= 1) {
    try {
      await lib.craft('shield', 1);
      console.log('Crafted shield!');
      const sh = bot.inventory.items().find(i => i.name === 'shield');
      if (sh) await bot.equip(sh, 'off-hand');
    } catch (e) {}
  }

  // Ensure golden_boots stay equipped!
  if (bot.inventory.slots[8]?.name !== 'golden_boots') {
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) await bot.equip(gb, 'feet');
  }

  console.log(`Re-feed complete! Food: ${bot.food}, HP: ${bot.health}`);
  bot.chat(`Beta: Re-fed and armed! Food: ${bot.food}/20, HP: ${bot.health}/20. Returning to Nether!`);

  // Warp back into Nether
  await enterNetherPortal(25000);
}

console.log(`Final dimension: ${bot.game.dimension}, pos: ${lib.fmt(bot.entity.position)}`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  gold_ingots: lib.count('gold_ingot')
};
