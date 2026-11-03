// programs/452-check-furnaces-and-heal.js
console.log('=== CHECK FURNACES & HEAL (GAMMA) ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Check the 3 furnaces inside base
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fpos of furnacePositions) {
  try {
    const fblock = bot.blockAt(fpos);
    if (fblock && fblock.name.includes('furnace')) {
      const furnace = await bot.openFurnace(fblock);
      console.log(`Furnace at ${lib.fmt(fpos)}:`);
      console.log(' input:', furnace.inputItem()?.name, furnace.inputItem()?.count);
      console.log(' fuel:', furnace.fuelItem()?.name, furnace.fuelItem()?.count);
      console.log(' output:', furnace.outputItem()?.name, furnace.outputItem()?.count);

      // Take output if it exists
      if (furnace.outputItem()) {
        const out = furnace.outputItem();
        await furnace.takeOutput();
        console.log(`Took ${out.name} x${out.count} from furnace output!`);
      }
      furnace.close();
    }
  } catch (e) {
    console.log(`Furnace check at ${lib.fmt(fpos)} note: ${e.message}`);
  }
}

// 2. If we obtained food, eat it
console.log('Checking food in inventory...');
for (const it of bot.inventory.items()) {
  if (it.name.includes('cooked_') || it.name.includes('bread') || it.name === 'apple' || it.name === 'baked_potato') {
    console.log(`Found edible food: ${it.name} x${it.count}`);
    while (bot.food < 20 && !isCancelled()) {
      await bot.equip(it, 'hand');
      bot.activateItem();
      await sleep(1800);
      bot.deactivateItem();
    }
  }
}

// 3. Wait for natural regeneration to restore health
console.log('Awaiting natural HP regeneration... current HP:', bot.health);
const waitStart = Date.now();
while (bot.health < 18 && Date.now() - waitStart < 25000 && !isCancelled()) {
  await sleep(1000);
}

console.log('Regeneration state: HP:', bot.health, 'Food:', bot.food, 'Inv:', JSON.stringify(lib.inv()));

return {
  hp: bot.health,
  food: bot.food,
  pos: bot.entity.position,
  inv: lib.inv()
};
