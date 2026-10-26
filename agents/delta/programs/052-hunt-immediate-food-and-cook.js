// programs/052-hunt-immediate-food-and-cook.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Step out through base door
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  console.log('Opening door...');
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294.5, -50);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Outside at:', lib.fmt(bot.entity.position));

// 2. Scan for animals within 40 blocks
const animalNames = ['cow', 'pig', 'sheep', 'chicken'];
const nearby = Object.values(bot.entities).filter(e => 
  animalNames.includes(e.name) && 
  e.position && 
  e.position.distanceTo(bot.entity.position) < 48
).sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${nearby.length} animals nearby`);

if (nearby.length > 0) {
  const target = nearby[0];
  console.log(`Hunting nearest animal: ${target.name} at distance ${target.position.distanceTo(bot.entity.position).toFixed(1)}m...`);
  try {
    const hr = await lib.hunt(target.name, 1);
    console.log('Hunt result:', JSON.stringify(hr));
  } catch (err) {
    console.log('Hunt error:', err.message);
  }
} else {
  console.log('No animals in view, using lib.hunt on sheep/cow');
  try {
    const hr = await lib.hunt('sheep', 1);
    console.log('Hunt sheep result:', JSON.stringify(hr));
  } catch (e) {
    console.log('Hunt sheep note:', e.message);
  }
}

// 3. Return inside base
console.log('Returning inside base...');
await lib.goTo(doorPos.x, doorPos.y, doorPos.z + 1, 1);
if (door && !bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
await lib.walkTo(294, -56);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Smelt raw meat if gathered
const rawKeys = ['beef', 'raw_beef', 'porkchop', 'raw_porkchop', 'mutton', 'raw_mutton', 'chicken', 'raw_chicken'];
const raw = Object.keys(lib.inv()).find(k => rawKeys.includes(k) && lib.inv()[k] > 0);
if (raw) {
  console.log(`Smelting ${lib.inv()[raw]} of ${raw}...`);
  try {
    await lib.smelt(raw, 'coal', lib.inv()[raw]);
  } catch (e) {
    console.log('Smelt raw meat note:', e.message);
  }
  // Eat cooked food
  try {
    await lib.eat();
    console.log('Ate cooked meat! Food now:', bot.food, 'Health now:', bot.health);
  } catch (e) {
    console.log('Eat note:', e.message);
  }
}

// 5. Check all furnaces and take finished iron ingots
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name}x${fw.inputItem()?.count} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log(`Took ${fw.outputItem().count} ${fw.outputItem().name}!`);
    }
    await fw.close();
  } catch (err) {
    console.log('Furnace error:', err.message);
  }
}

console.log('Inventory now:', JSON.stringify(lib.inv()));
bot.chat(`delta: Status: Food: ${bot.food}/20, Health: ${bot.health}/20. Iron ingots: ${lib.count('iron_ingot')}.`);
