// programs/787-retreat-to-base-and-gather-food.js
globalThis.isProgramCancelled = isCancelled;
console.log('=== Program 787: Retreat to Base & Gather Food ===');
console.log('Initial Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

bot.clearControlStates();
bot.pathfinder.stop();

// Ensure golden boots stay equipped
async function ensureGoldenBoots() {
  if (bot.inventory.slots[8]?.name !== 'golden_boots') {
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) {
      try { await bot.equip(gb, 'feet'); } catch (e) {}
    }
  }
}
await ensureGoldenBoots();

// Configure safe movements
function setupMovements() {
  const moves = new Movements(bot, mcData);
  if (mcData.blocksByName.fire) moves.blocksToAvoid.add(mcData.blocksByName.fire.id);
  if (mcData.blocksByName.soul_fire) moves.blocksToAvoid.add(mcData.blocksByName.soul_fire.id);
  if (mcData.blocksByName.lava) moves.blocksToAvoid.add(mcData.blocksByName.lava.id);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);
}
setupMovements();

async function extinguishFireNearby() {
  const fires = bot.findBlocks({
    matching: b => b && (b.name === 'fire' || b.name === 'soul_fire'),
    maxDistance: 6,
    count: 10
  });
  for (const fp of fires) {
    try {
      const b = bot.blockAt(fp);
      if (b) await bot.dig(b, true);
    } catch (e) {}
  }
}

// Step 1: March south to portal if in the_nether
if (bot.game.dimension === 'the_nether') {
  bot.chat('Beta: Moving to Nether portal to resupply food and health!');
  
  const returnWps = [
    new Vec3(63, 65, -20),
    new Vec3(63, 64, -7),
    new Vec3(54, 65, -7),
    new Vec3(46, 65, -7),
    new Vec3(46.5, 66.0, 2.0)
  ];

  for (let i = 0; i < returnWps.length && !isCancelled(); i++) {
    const wp = returnWps[i];
    if (bot.entity.position.distanceTo(wp) < 2.0) continue;

    console.log(`Heading to WP ${i + 1}/${returnWps.length}: ${lib.fmt(wp)}`);
    await extinguishFireNearby();
    await bot.lookAt(new Vec3(wp.x, 64.0, wp.z)); // Keep gaze low

    try {
      await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 1.8));
    } catch (e) {
      console.log(`Pathfinder retry to ${lib.fmt(wp)}: ${e.message}`);
      await extinguishFireNearby();
      try {
        await bot.pathfinder.goto(new goals.GoalNear(wp.x, wp.y, wp.z, 2.5));
      } catch (e2) {}
    }
    await extinguishFireNearby();
  }

  // Find portal block near (46.5, 66.0, 2.0)
  const portals = bot.findBlocks({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 8,
    count: 10
  });

  if (portals.length > 0) {
    portals.sort((a, b) => bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
    const targetPortal = portals[0];
    const pCenter = targetPortal.offset(0.5, 0.2, 0.5);

    console.log(`Entering portal at ${lib.fmt(pCenter)}...`);
    await bot.lookAt(pCenter, true);
    bot.setControlState('forward', true);
    if (bot.entity.position.y < targetPortal.y) bot.setControlState('jump', true);
    await sleep(600);
    bot.setControlState('jump', false);
    bot.setControlState('forward', false);

    console.log('Standing in portal, waiting for warp...');
    const warpStart = Date.now();
    while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 25000 && !isCancelled()) {
      const cur = bot.entity.position;
      if (Math.abs(cur.x - pCenter.x) > 0.4 || Math.abs(cur.z - pCenter.z) > 0.4) {
        await bot.lookAt(pCenter, true);
        bot.setControlState('forward', true);
        await sleep(150);
        bot.setControlState('forward', false);
      }
      await sleep(250);
    }
  }
}

if (bot.game.dimension !== 'overworld') {
  console.log('Current pos (still in Nether or warp timed out):', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
  return { dimension: bot.game.dimension, pos: bot.entity.position, hp: bot.health };
}

console.log('SUCCESS: Warped to Overworld! Pos:', lib.fmt(bot.entity.position));

// Step 2: Walk into base room at (293, 72, -55)
try {
  await lib.goTo(293, 72, -55, 1.5, { timeoutMs: 8000 });
} catch (e) {
  console.log('lib.goTo base warning:', e.message);
}

// Step 3: Check base chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
let chestItems = [];
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    chestItems = chest.items().map(i => `${i.name}x${i.count}`);
    console.log('Chest items:', chestItems.join(', '));

    // Deposit iron_boots so lib.equipArmor never swaps golden_boots
    const ib = bot.inventory.items().find(i => i.name === 'iron_boots');
    if (ib) {
      await chest.deposit(ib.type, null, ib.count);
      console.log('Deposited iron_boots in chest for safety.');
    }

    // Withdraw food if available
    const foodItem = chest.items().find(i => 
      ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'bread', 'apple', 'cooked_chicken'].includes(i.name)
    );
    if (foodItem && foodItem.count > 0) {
      const takeCount = Math.min(foodItem.count, 8);
      await chest.withdraw(foodItem.type, null, takeCount);
      console.log(`Withdrew ${takeCount} of ${foodItem.name} from chest!`);
    }

    // Check for gold in chest
    const goldIngotsInChest = chest.items().find(i => i.name === 'gold_ingot');
    if (goldIngotsInChest && goldIngotsInChest.count > 0) {
      const takeGold = Math.min(goldIngotsInChest.count, 10);
      await chest.withdraw(goldIngotsInChest.type, null, takeGold);
      console.log(`Withdrew ${takeGold} gold ingots from chest for bartering!`);
    }

    await chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Step 4: Eat if hungry or wounded
try {
  await lib.eat();
  console.log('Ate food! Hunger now:', bot.food, 'HP:', bot.health);
} catch (e) {
  console.log('lib.eat warning:', e.message);
}

// Step 5: Sleep if night
if (lib.time().canSleep) {
  console.log('Sleeping in bed...');
  try {
    await lib.sleepInBed();
    await sleep(3000);
  } catch (e) {
    console.log('Sleep warning:', e.message);
  }
}

// Ensure golden boots still worn
await ensureGoldenBoots();

console.log('=== Program 787 Summary ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);
console.log('HP:', bot.health, 'Food:', bot.food);
console.log('Inventory:', lib.inv());
console.log('Feet slot:', bot.inventory.slots[8]?.name);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  golden_boots: bot.inventory.slots[8]?.name === 'golden_boots',
  inventory: lib.inv()
};
