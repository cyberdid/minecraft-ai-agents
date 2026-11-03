// programs/777-withdraw-gold-and-enter-nether.js
console.log('=== Program 777: Withdraw Gold, Consolidate & Enter Nether ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: Open base chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    console.log('Base chest items:', chest.containerItems().map(i => `${i.name}x${i.count}`).join(', '));

    const ingot = chest.containerItems().find(i => i.name === 'gold_ingot');
    if (ingot) {
      await chest.withdraw(ingot.type, null, ingot.count);
      console.log(`Withdrew ${ingot.count} gold_ingot from base chest!`);
    }

    const nugget = chest.containerItems().find(i => i.name === 'gold_nugget');
    if (nugget) {
      await chest.withdraw(nugget.type, null, nugget.count);
      console.log(`Withdrew ${nugget.count} gold_nugget from base chest!`);
    }

    // Check for food in chest
    for (const item of chest.containerItems()) {
      if (['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'bread', 'apple'].includes(item.name)) {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.count} ${item.name} from base chest!`);
      }
    }

    await chest.close();
  } catch (e) {
    console.log('Chest access note:', e.message);
  }
}

// Step 2: Craft any possible gold ingots
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  try {
    await lib.craft('gold_ingot', Math.floor(nuggets / 9));
    console.log(`Crafted ingots! Total gold_ingot: ${lib.count('gold_ingot')}`);
  } catch (e) {}
}

console.log('Total gold ingots on Beta:', lib.count('gold_ingot'));

// Step 3: Verify armor & weapons
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) await bot.equip(gb, 'feet');
}
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Step 4: Step into Nether Portal
console.log('Entering Nether Portal to join team...');
const portals = bot.findBlocks({
  matching: b => b && b.name === 'nether_portal',
  maxDistance: 8,
  count: 10
});

if (portals.length > 0) {
  portals.sort((a, b) => a.y - b.y || bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
  const targetPortal = portals[0];
  const pCenter = targetPortal.offset(0.5, 0.2, 0.5);

  await bot.lookAt(pCenter, true);
  bot.setControlState('forward', true);
  if (bot.entity.position.y < targetPortal.y) bot.setControlState('jump', true);
  await sleep(600);
  bot.setControlState('jump', false);
  bot.setControlState('forward', false);

  const warpStart = Date.now();
  while (bot.game.dimension !== 'the_nether' && Date.now() - warpStart < 25000 && !isCancelled()) {
    const cur = bot.entity.position;
    if (Math.abs(cur.x - pCenter.x) > 0.4 || Math.abs(cur.z - pCenter.z) > 0.4 || cur.y < targetPortal.y - 0.2) {
      await bot.lookAt(pCenter, true);
      bot.setControlState('forward', true);
      if (cur.y < targetPortal.y) bot.setControlState('jump', true);
      await sleep(150);
      bot.setControlState('jump', false);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

if (bot.game.dimension === 'the_nether') {
  console.log('SUCCESS: Beta in the_nether at:', lib.fmt(bot.entity.position));
  bot.activateItem(true); // Raise shield
  configureFireAvoidance();

  // Walk forward into bunker
  await sleep(300);
  try {
    await bot.pathfinder.goto(new goals.GoalNear(41.0, 65.0, -6.0, 1.5));
  } catch (e) {}

  bot.chat(`Beta: In Nether bunker holding ${lib.count('gold_ingot')} gold ingots! Ready for bartering & pearl hunt!`);
}

console.log('=== Program 777 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Feet armor slot:', bot.inventory.slots[8]?.name);
console.log('Gold ingots:', lib.count('gold_ingot'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget')
};
