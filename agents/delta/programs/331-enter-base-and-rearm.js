// programs/331-enter-base-and-rearm.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Walk 24m to base door at (294, 72, -54)
console.log('Moving to base door at (294, 72, -54)...');
try {
  await lib.goTo(294, 72, -54, 1);
} catch (e) {
  await bot.lookAt(new Vec3(294, 72, -54), true);
  bot.setControlState('forward', true);
  bot.setControlState('sprint', true);
  await sleep(2000);
  bot.clearControlStates();
}

// 2. Enter base through door
console.log('Entering base...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -54, 1));
    await lib.goThroughDoor(294, 72, -54);
  } catch (e2) {}
}
console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

// 3. Open chest at (293, 72, -57) and withdraw cobblestone, planks, tools
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest items (${items.length}):`);
    for (const item of items) {
      console.log(`  ${item.name} x${item.count}`);
      if (item.name === 'cobblestone' || item.name.endsWith('_planks') || item.name.includes('sword') || item.name.includes('pickaxe') || item.name.includes('iron') || item.name.includes('shield')) {
        try {
          await chest.withdraw(item.type, null, item.count);
          console.log(`Withdrew ${item.name} x${item.count}`);
        } catch (we) {}
      }
    }
    chest.close();
  } catch (ce) {
    console.log('Chest error:', ce.message);
  }
}

// 4. Check inventory
console.log('Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

// If we need a sword, craft one
if (lib.count('stone_sword') === 0) {
  if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  }
}

// If we need a pickaxe, craft one
if (lib.count('stone_pickaxe') === 0) {
  if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
    await lib.craft('stone_pickaxe', 1);
    console.log('Stone pickaxe crafted!');
  }
}

const sword = bot.inventory.items().find(i => i.name.endsWith('_sword'));
if (sword) await bot.equip(sword, 'hand');

// 5. Exit base and enter Nether portal
console.log('Exiting base towards portal...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {}

console.log('Stepping into Nether portal at (299.5, 73.0, -53.5)...');
try {
  await lib.goTo(299, 72, -52, 1);
} catch (e) {}

bot.setControlState('jump', true);
await lib.walkTo(299.5, -53.5, 3000);
bot.clearControlStates();

console.log('Waiting for Nether transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (String(bot.game.dimension).includes('nether')) {
  bot.chat(`delta: Re-entered Nether at ${lib.fmt(bot.entity.position)} armed with ${sword ? sword.name : 'weapon'} & ${lib.count('cobblestone')} cobble! Advancing to Spawner front!`);
}
