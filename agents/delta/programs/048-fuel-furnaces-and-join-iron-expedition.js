// programs/048-fuel-furnaces-and-join-iron-expedition.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Withdraw 4 coal from chest
const chestPos = new Vec3(293, 72, -57);
try {
  await lib.withdraw({ coal: 4 }, chestPos.x, chestPos.y, chestPos.z);
  console.log('Withdrew 4 coal from chest!');
} catch (e) {
  console.log('Withdraw note:', e.message);
}

// 2. Put coal into the furnaces
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  if (lib.count('coal') < 2) break;
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name} fuel=${fw.fuelItem()?.name}`);
    if (!fw.fuelItem() || fw.fuelItem().count < 2) {
      await fw.putFuel(mcData.itemsByName.coal.id, null, 2);
      console.log('Put 2 coal into furnace fuel slot!');
    }
    await fw.close();
  } catch (err) {
    console.log('Furnace fuel note:', err.message);
  }
}

// 3. Step out through base door
const doorPos = new Vec3(294, 72, -54);
const door = bot.blockAt(doorPos);
if (door && !door.getProperties().open) {
  await bot.activateBlock(door);
  await sleep(200);
}
await lib.walkTo(294.5, -50);
if (door && bot.blockAt(doorPos).getProperties().open) {
  await bot.activateBlock(bot.blockAt(doorPos));
  await sleep(200);
}
console.log('Outside at:', lib.fmt(bot.entity.position));

// 4. Check for any animals along the way
const animalNames = ['cow', 'pig', 'sheep', 'chicken'];
const animals = Object.values(bot.entities).filter(e => 
  animalNames.includes(e.name) && 
  e.position && 
  e.position.distanceTo(bot.entity.position) < 32
);
if (animals.length > 0) {
  console.log('Hunting animal:', animals[0].name);
  try {
    await lib.hunt(animals[0].name, 1);
  } catch (e) {
    console.log('Hunt note:', e.message);
  }
}

// 5. Travel to East hill (350, 55, -35)
console.log('Heading to East hill (350, 55, -35)...');
await lib.goToXZ(350, -35);
console.log('At East hill:', lib.fmt(bot.entity.position));

bot.chat('delta: At East hill with team! Mining iron and coal for Milestone 3 full armor!');
