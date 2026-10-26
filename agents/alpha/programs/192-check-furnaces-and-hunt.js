// programs/192-check-furnaces-and-hunt.js
console.log('--- Checking Base Furnaces and Food ---');
console.log('Start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const pos of furnacePositions) {
  const block = bot.blockAt(pos);
  if (block && block.name === 'furnace') {
    try {
      const furnace = await bot.openFurnace(block);
      const input = furnace.inputItem();
      const fuel = furnace.fuelItem();
      const output = furnace.outputItem();
      console.log(`Furnace at ${lib.fmt(pos)}: input=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, output=${output?.name}x${output?.count}`);
      if (output) {
        console.log(`Taking output ${output.name} x${output.count}...`);
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {
      console.log(`Error checking furnace at ${lib.fmt(pos)}:`, e.message);
    }
  }
}

// Try eating anything edible now in inventory
const edible = ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple', 'baked_potato', 'beef', 'porkchop', 'mutton', 'chicken'];
for (const foodName of edible) {
  const count = lib.count(foodName);
  if (count > 0) {
    console.log(`Found ${count} ${foodName} in inventory, eating...`);
    const item = bot.inventory.items().find(i => i.name === foodName);
    if (item) {
      await bot.equip(item, 'hand');
      bot.deactivateItem();
      bot.activateItem();
      await sleep(2500);
      bot.deactivateItem();
      console.log(`Ate ${foodName}. Food now:`, bot.food, 'Health:', bot.health);
      break;
    }
  }
}

// Check Beta
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Beta at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

bot.chat('beta: What is your status? Do you hold the diamond pickaxe, bucket, and flint & steel?');

// If food is still 0, look for nearby animals
if (bot.food < 6) {
  console.log('Food is still low. Scanning for animals...');
  const animals = ['cow', 'pig', 'sheep', 'chicken'];
  const targets = Object.values(bot.entities)
    .filter(e => e && animals.includes(e.name) && e.position && e.position.distanceTo(bot.entity.position) < 40)
    .map(e => ({ name: e.name, pos: lib.fmt(e.position), dist: e.position.distanceTo(bot.entity.position).toFixed(1) }))
    .sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));

  console.log(`Nearby animals within 40 blocks:`, JSON.stringify(targets));

  if (targets.length > 0) {
    const targetInfo = targets[0];
    console.log(`Hunting nearest ${targetInfo.name} at dist ${targetInfo.dist}...`);
    try {
      if (typeof passDoorOut === 'function') {
        await passDoorOut();
      } else {
        await lib.goThroughDoor(294, 72, -54);
      }
      console.log('Outside base. Starting hunt...');
      const huntRes = await lib.hunt(targetInfo.name, 1);
      console.log('Hunt result:', JSON.stringify(huntRes));

      // Return to base door
      await lib.goTo(294, 72, -52, 1);
      if (typeof passDoorIn === 'function') {
        await passDoorIn();
      } else {
        await lib.goThroughDoor(294, 72, -54);
      }
      console.log('Safely back inside base.');

      // Check if we got meat to smelt
      for (const m of ['beef', 'porkchop', 'mutton', 'chicken']) {
        if (lib.count(m) > 0) {
          console.log(`Smelting ${m}...`);
          await lib.smelt(m, 'birch_planks', lib.count(m));
          const cookedName = 'cooked_' + m;
          const cookedItem = bot.inventory.items().find(i => i.name === cookedName);
          if (cookedItem) {
            console.log(`Eating ${cookedName}...`);
            await bot.equip(cookedItem, 'hand');
            bot.deactivateItem();
            bot.activateItem();
            await sleep(2500);
            bot.deactivateItem();
            console.log('Food now:', bot.food, 'Health:', bot.health);
          }
        }
      }
    } catch (e) {
      console.log('Hunt/smelt error:', e.message);
      // Ensure we are inside base if daytime or not
      try {
        await lib.goTo(294, 72, -52, 1);
        if (typeof passDoorIn === 'function') await passDoorIn();
      } catch (e2) {}
    }
  } else {
    console.log('No animals found within 40 blocks.');
  }
}

console.log('End pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'Health:', bot.health, 'Night in:', lib.time().secondsUntilNight, 's');
