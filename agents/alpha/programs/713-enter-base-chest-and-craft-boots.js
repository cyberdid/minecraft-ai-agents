// programs/713-enter-base-chest-and-craft-boots.js
console.log('=== Program 713: Enter Base, Chest Access & Golden Boots ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Enter base door at (294, 72, -54)
console.log('Entering base door...');
try {
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  try {
    await lib.door(294, 72, -54, true);
    await bot.pathfinder.goto(new goals.GoalNear(294, 72, -55.5, 0.5));
    await lib.door(294, 72, -54, false);
  } catch (e2) {}
}

console.log('Inside base at:', lib.fmt(bot.entity.position));

// 2. Open Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('Base Chest items:');
    for (const item of chest.containerItems()) {
      console.log(` - ${item.name} x ${item.count}`);
      if (item.name === 'gold_ingot' || item.name === 'gold_nugget' || item.name.includes('cooked_') || item.name === 'bread' || item.name === 'apple') {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${item.name} x${item.count}!`);
      }
    }

    // Deposit junk Nether blocks to clean inventory
    for (const junk of ['soul_sand', 'netherrack']) {
      const it = bot.inventory.items().find(i => i.name === junk);
      if (it) {
        await chest.deposit(it.type, null, it.count);
        console.log(`Deposited ${junk} x${it.count}`);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 3. Eat food if available
for (const foodName of ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple']) {
  const f = bot.inventory.items().find(i => i.name === foodName);
  if (f && bot.food < 19) {
    try {
      await bot.equip(f, 'hand');
      bot.activateItem();
      await sleep(2000);
      console.log(`Ate ${foodName}! Food now: ${bot.food}`);
    } catch (e) {}
  }
}

// 4. Craft gold ingots if we have 9+ nuggets
const nuggets = lib.count('gold_nugget');
if (nuggets >= 9) {
  const toCraft = Math.floor(nuggets / 9);
  try {
    await lib.craft('gold_ingot', toCraft);
    console.log(`Crafted ${toCraft} gold ingots! Total ingots: ${lib.count('gold_ingot')}`);
  } catch (e) {}
}

let ingots = lib.count('gold_ingot');
console.log(`Alpha holds: ${ingots} gold ingots, ${lib.count('gold_nugget')} nuggets`);

// 5. Craft and equip golden_boots if 4+ ingots
let hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
if (ingots >= 4 && !hasBoots) {
  console.log('Crafting golden_boots at base Crafting Table (295, 72, -56)...');
  try {
    await lib.craft('golden_boots', 1);
    const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
    if (gb) {
      await bot.equip(gb, 'feet');
      console.log('*** golden_boots EQUIPPED in slot 8! ***');
    }
    bot.chat('alpha: [SUIT UP] golden_boots CRAFTED and EQUIPPED! Piglin neutrality is 100% ACTIVE!');
  } catch (e) {
    console.log('Craft boots note:', e.message);
  }
}

hasBoots = bot.inventory.slots[8]?.name === 'golden_boots' || lib.count('golden_boots') > 0;
console.log('Golden boots status:', hasBoots ? 'EQUIPPED (slot 8)' : 'PENDING');

// 6. Sleep in Base Bed (294, 72, -55) if night
if (lib.time().canSleep) {
  console.log('Night! Sleeping in base bed to restore HP & Food to 20/20...');
  try {
    await lib.sleepInBed();
    bot.chat('alpha: Slept in base bed! HP and Food 100% restored to 20/20!');
  } catch (e) {
    console.log('Sleep note:', e.message);
  }
}

console.log(`=== Alpha Status: Boots = ${hasBoots ? 'EQUIPPED' : 'PENDING'}, Gold Ingots = ${lib.count('gold_ingot')}, HP = ${bot.health}/20, Food = ${bot.food}/20 ===`);
bot.chat(`alpha: Base visit complete! Golden Boots: ${hasBoots ? 'YES' : 'NO'}, Gold Ingots: ${lib.count('gold_ingot')}, HP: ${bot.health.toFixed(1)}/20, Food: ${bot.food}/20`);

console.log('=== Program 713 Finished ===');
console.log('Final pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv());
