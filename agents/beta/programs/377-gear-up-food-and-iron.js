// programs/377-gear-up-food-and-iron.js
console.log('=== Step: Craft basic stone tools, hunt food, cook and eat ===');
console.log('Beta start pos:', lib.fmt(bot.entity.position));

// 1. Withdraw cobblestone and coal from chest
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openChest(chestBlock);
    const cobble = chest.containerItems().find(i => i.name === 'cobblestone');
    if (cobble) {
      await chest.withdraw(cobble.type, null, 16);
      console.log('Withdrew 16 cobblestone.');
    }
    const coal = chest.containerItems().find(i => i.name === 'coal');
    if (coal) {
      await chest.withdraw(coal.type, null, 8);
      console.log('Withdrew 8 coal.');
    }
    chest.close();
  } catch (e) {
    console.log('Chest withdraw note:', e.message);
  }
}

// 2. Punch 1 tree block outside door if we need wood/sticks
if (lib.count('stick') < 2) {
  console.log('Exiting base door to punch 1 log for sticks...');
  try {
    await lib.goThroughDoor(294, 72, -54);
    await lib.obtain('stick', 4);
    console.log('Obtained sticks!');
    await lib.goTo(294, 72, -53, 1);
    await lib.goThroughDoor(294, 72, -54);
  } catch (err) {
    console.log('Stick obtain note:', err.message);
  }
}

// 3. Craft stone_sword and stone_pickaxe
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  try {
    await lib.craft('stone_sword', 1);
    console.log('Crafted stone_sword!');
  } catch (e) {
    console.log('Craft sword note:', e.message);
  }
}

if (lib.count('stone_pickaxe') === 0 && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  try {
    await lib.craft('stone_pickaxe', 1);
    console.log('Crafted stone_pickaxe!');
  } catch (e) {
    console.log('Craft pickaxe note:', e.message);
  }
}

// 4. Hunt 2 animals outside for food
console.log('Exiting base to hunt for meat...');
try {
  await lib.goThroughDoor(294, 72, -54);
  if (lib.count('stone_sword') > 0) {
    await bot.equip(mcData.itemsByName.stone_sword.id, 'hand');
  }
  await lib.obtain('cooked_beef', 2);
  console.log('Got cooked beef!');
} catch (e) {
  console.log('Hunt note:', e.message);
  try {
    await lib.obtain('cooked_mutton', 2);
    console.log('Got cooked mutton!');
  } catch (err2) {
    console.log('Mutton note:', err2.message);
  }
}

// 5. Eat food
const foods = ['cooked_beef', 'cooked_mutton', 'cooked_porkchop', 'cooked_chicken'];
for (const f of foods) {
  if (lib.count(f) > 0 && bot.food < 20) {
    await bot.equip(mcData.itemsByName[f].id, 'hand');
    await bot.consume();
    console.log('Ate food! Hunger:', bot.food, 'health:', bot.health);
  }
}

// 6. Return to base
try {
  await lib.goTo(294, 72, -53, 1);
  await lib.goThroughDoor(294, 72, -54);
} catch (e) {
  console.log('Return note:', e.message);
}

console.log('Beta final inventory:', JSON.stringify(lib.inv()));
bot.chat(`beta: Geared up! Health: ${bot.health}/20, Food: ${bot.food}/20. Tools: ${JSON.stringify(lib.tools())}. Joining East hill iron mining!`);
