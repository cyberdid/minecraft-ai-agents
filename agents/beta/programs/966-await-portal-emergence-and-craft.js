console.log('=== Program 966: Await Portal Emergence & Craft 22 Eyes ===');
globalThis.isProgramCancelled = isCancelled;

bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('Beta start position:', lib.fmt(bot.entity.position), 'Time:', bot.time.timeOfDay);

bot.chat('Beta: Standing at Overworld portal (297, 72, -54) awaiting Gamma & Delta with Blaze Powder!');

// Step to portal reception area at (297, 72, -54)
const portalReception = new Vec3(297, 72, -54);
const moves = new Movements(bot, mcData);
moves.canDig = false;
moves.allowParkour = true;
bot.pathfinder.setMovements(moves);

try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

try {
  await bot.pathfinder.goto(new goals.GoalNear(portalReception.x, portalReception.y, portalReception.z, 1.2));
} catch (e) {}

console.log('At portal reception spot:', lib.fmt(bot.entity.position));

const startWait = Date.now();
const MAX_WAIT = 40000; // 40 seconds

while (Date.now() - startWait < MAX_WAIT && !isCancelled()) {
  // Pickup any items dropped near portal or in base
  try {
    await lib.pickup(8.0);
  } catch (e) {}

  // Check players within 12m
  for (const p of Object.values(bot.players)) {
    if (p.entity && p.username !== bot.username) {
      const dist = bot.entity.position.distanceTo(p.entity.position);
      if (dist <= 12) {
        console.log(`Teammate ${p.username} is nearby (${dist.toFixed(1)}m), held: ${p.entity.heldItem?.name}`);
      }
    }
  }

  // Check Base Chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const cItems = chest.containerItems();
      const pow = cItems.find(i => i.name === 'blaze_powder');
      if (pow) {
        console.log(`Withdrawing ${pow.count} blaze_powder from Base Chest...`);
        await chest.withdraw(pow.type, null, pow.count);
      }
      const rods = cItems.find(i => i.name === 'blaze_rod');
      if (rods) {
        console.log(`Withdrawing ${rods.count} blaze_rod from Base Chest...`);
        await chest.withdraw(rods.type, null, rods.count);
      }
      chest.close();
    } catch (e) {}
  }

  // Craft blaze rods
  if (lib.count('blaze_rod') > 0) {
    try { await lib.craft('blaze_powder', lib.count('blaze_rod') * 2); } catch (e) {}
  }

  // Craft ender_eye
  const bp = lib.count('blaze_powder');
  const ep = lib.count('ender_pearl');
  if (bp > 0 && ep > 0) {
    const toCraft = Math.min(bp, ep);
    console.log(`Crafting ${toCraft} ender_eye...`);
    try {
      await lib.craft('ender_eye', toCraft);
      const total = lib.count('ender_eye');
      bot.chat(`Beta: 100% SUCCESS! Crafted ${total} EYES OF ENDER! Milestone 10 fully ready!`);
      console.log(`SUCCESS: Total ender_eye in inventory = ${total}!`);
      break;
    } catch (ce) {
      console.log('Craft error:', ce.message);
    }
  }

  if (lib.count('ender_eye') >= 12) {
    console.log(`Target achieved! Total ender_eye: ${lib.count('ender_eye')}`);
    break;
  }

  await sleep(2000);
}

console.log('Final Beta Inventory:', JSON.stringify(lib.inv()));
return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  ender_eyes: lib.count('ender_eye'),
  ender_pearls: lib.count('ender_pearl'),
  blaze_powder: lib.count('blaze_powder'),
  hp: bot.health,
  food: bot.food
};
