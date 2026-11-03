// programs/757-enter-portal-and-craft-boots.js
console.log('=== Program 757: Enter Portal, Craft Golden Boots & Regear ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);
console.log('Nuggets on Beta:', lib.count('gold_nugget'));

bot.clearControlStates();
bot.pathfinder.stop();

// Step 1: In the_nether, find nether_portal and stand inside until dimension is overworld
if (bot.game.dimension === 'the_nether') {
  const portals = bot.findBlocks({
    matching: b => b && b.name === 'nether_portal',
    maxDistance: 12,
    count: 10
  });
  console.log(`Found ${portals.length} nether_portal blocks:`, portals.map(p => lib.fmt(p)).join(', '));

  if (portals.length === 0) {
    throw new Error('No nether_portal blocks found within 12m of Beta!');
  }

  // Sort by lowest Y and nearest to bot
  portals.sort((a, b) => a.y - b.y || bot.entity.position.distanceTo(a) - bot.entity.position.distanceTo(b));
  const targetPortal = portals[0];
  console.log(`Navigating into target portal block at ${lib.fmt(targetPortal)}...`);

  const moves = new Movements(bot, mcData);
  moves.canDig = false;
  moves.allowParkour = false;
  bot.pathfinder.setMovements(moves);

  try {
    await bot.pathfinder.goto(new goals.GoalBlock(targetPortal.x, targetPortal.y, targetPortal.z));
  } catch (e) {
    console.log('Pathfinder goto portal note:', e.message);
  }

  // Walk directly onto the center of the portal block
  const pCenter = targetPortal.offset(0.5, 0, 0.5);
  await bot.lookAt(pCenter, true);
  bot.setControlState('forward', true);
  await sleep(600);
  bot.setControlState('forward', false);

  console.log('Waiting for Nether portal warp (survival 4.0s contact timer)...');
  const warpStart = Date.now();
  while (bot.game.dimension !== 'overworld' && Date.now() - warpStart < 30000 && !isCancelled()) {
    const cur = bot.entity.position;
    // Keep bot gently centered if drifting
    if (Math.abs(cur.x - pCenter.x) > 0.4 || Math.abs(cur.z - pCenter.z) > 0.4) {
      await bot.lookAt(pCenter, true);
      bot.setControlState('forward', true);
      await sleep(150);
      bot.setControlState('forward', false);
    }
    await sleep(250);
  }
}

if (bot.game.dimension !== 'overworld') {
  throw new Error(`Failed to warp to overworld; still in ${bot.game.dimension} at ${lib.fmt(bot.entity.position)}`);
}

console.log('Successfully warped to Overworld! Pos:', lib.fmt(bot.entity.position));

// Step 2: Step forward out of portal into base room
await sleep(500);
try {
  await lib.goTo(294, 72, -56, 1.0, { timeoutMs: 6000 });
} catch (e) {
  console.log('Step into base note:', e.message);
}

// Step 3: Craft gold ingots from gold nuggets (41 nuggets -> 4 ingots)
const nuggets = lib.count('gold_nugget');
console.log(`Beta has ${nuggets} gold nuggets`);
if (nuggets >= 9) {
  const ingotRecipe = bot.recipesFor(mcData.itemsByName.gold_ingot.id, null, 1, null)[0];
  if (ingotRecipe) {
    const numIngots = Math.floor(nuggets / 9);
    console.log(`Crafting ${numIngots} gold ingots...`);
    try {
      await bot.craft(ingotRecipe, numIngots, null);
      console.log(`Crafted ${numIngots} gold ingots! Total ingots now: ${lib.count('gold_ingot')}`);
    } catch (e) {
      console.log('Craft ingots note:', e.message);
    }
  }
}

// Step 4: Craft golden_boots at base crafting table (295, 72, -56)
console.log('Total gold ingots:', lib.count('gold_ingot'));
const table = bot.blockAt(new Vec3(295, 72, -56)) || bot.findBlock({ matching: b => b && b.name.includes('crafting_table'), maxDistance: 6 });
console.log('Crafting table found at:', table ? lib.fmt(table.position) : 'none');

if (lib.count('gold_ingot') >= 4 && table) {
  const bootsRecipe = bot.recipesFor(mcData.itemsByName.golden_boots.id, null, 1, table)[0];
  if (bootsRecipe) {
    console.log('Crafting golden_boots on crafting table...');
    try {
      await bot.craft(bootsRecipe, 1, table);
      console.log('Successfully crafted golden_boots!');
    } catch (e) {
      console.log('Craft boots error:', e.message);
    }
  }
}

// Step 5: Equip golden_boots in feet armor slot
const boots = bot.inventory.items().find(i => i.name === 'golden_boots');
if (boots) {
  console.log('Equipping golden_boots into feet armor slot...');
  try {
    await bot.equip(boots, 'feet');
    console.log('Golden boots equipped! Feet slot:', bot.inventory.slots[8]?.name);
    bot.chat('Beta: CRAFTED AND EQUIPPED GOLDEN BOOTS! 100% PIGLIN NEUTRALITY ACTIVE!');
  } catch (e) {
    console.log('Equip golden_boots error:', e.message);
  }
}

// Step 6: Access base chest at (293, 72, -57) to regear and consolidate bartering gold
const chestBlock = bot.blockAt(new Vec3(293, 72, -57)) || bot.findBlock({ matching: b => b && b.name.includes('chest'), maxDistance: 6 });
if (chestBlock) {
  console.log('Opening base chest at:', lib.fmt(chestBlock.position));
  try {
    const chest = await bot.openChest(chestBlock);
    const chestItems = chest.containerItems().map(i => `${i.name}x${i.count}`).join(', ');
    console.log('Base chest contents:', chestItems);

    // Withdraw any missing armor if Beta lacks it
    const armorTypes = ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'shield'];
    for (const aName of armorTypes) {
      if (lib.count(aName) === 0 && !Object.values(bot.inventory.slots).some(s => s && s.name === aName)) {
        const item = chest.containerItems().find(i => i.name === aName);
        if (item) {
          console.log(`Withdrawing ${aName} from chest...`);
          await chest.withdraw(item.type, null, 1);
        }
      }
    }

    // Withdraw extra gold for bartering
    const cIngot = chest.containerItems().find(i => i.name === 'gold_ingot');
    if (cIngot) {
      await chest.withdraw(cIngot.type, null, cIngot.count);
      console.log(`Withdrew ${cIngot.count} gold_ingot from chest!`);
    }
    const cNugget = chest.containerItems().find(i => i.name === 'gold_nugget');
    if (cNugget) {
      await chest.withdraw(cNugget.type, null, cNugget.count);
      console.log(`Withdrew ${cNugget.count} gold_nugget from chest!`);
    }

    // Deposit surplus netherrack to save inventory space
    const nr = bot.inventory.items().find(i => i.name === 'netherrack');
    if (nr && nr.count > 16) {
      await chest.deposit(nr.type, null, nr.count - 16);
      console.log(`Deposited ${nr.count - 16} netherrack into chest`);
    }

    await chest.close();
  } catch (err) {
    console.log('Chest interaction note:', err.message);
  }
}

// Convert any extra nuggets to ingots
const remainingNuggets = lib.count('gold_nugget');
if (remainingNuggets >= 9) {
  const ingotRecipe = bot.recipesFor(mcData.itemsByName.gold_ingot.id, null, 1, null)[0];
  if (ingotRecipe) {
    try {
      await bot.craft(ingotRecipe, Math.floor(remainingNuggets / 9), null);
    } catch (e) {}
  }
}

// Equip armor and weapons
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('=== Final Status ===');
console.log('Position:', lib.fmt(bot.entity.position), 'Dimension:', bot.game.dimension);
console.log('Armor worn:', {
  head: bot.inventory.slots[5]?.name,
  chest: bot.inventory.slots[6]?.name,
  legs: bot.inventory.slots[7]?.name,
  feet: bot.inventory.slots[8]?.name,
  offhand: bot.inventory.slots[45]?.name
});
console.log('Gold ingots for bartering:', lib.count('gold_ingot'));
console.log('Inventory:', lib.inv());

return {
  dimension: bot.game.dimension,
  golden_boots_equipped: bot.inventory.slots[8]?.name === 'golden_boots',
  armor: {
    head: bot.inventory.slots[5]?.name,
    chest: bot.inventory.slots[6]?.name,
    legs: bot.inventory.slots[7]?.name,
    feet: bot.inventory.slots[8]?.name,
    offhand: bot.inventory.slots[45]?.name
  },
  gold_ingots: lib.count('gold_ingot'),
  gold_nuggets: lib.count('gold_nugget'),
  hp: bot.health,
  food: bot.food
};
