// programs/054-consume-remaining-flesh-and-check-team.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Health:', bot.health, 'Food:', bot.food);

// 1. Consume remaining rotten flesh in inventory
if (lib.count('rotten_flesh') > 0) {
  const fleshItem = mcData.itemsByName.rotten_flesh;
  for (let i = 0; i < lib.count('rotten_flesh'); i++) {
    await bot.equip(fleshItem.id, 'hand');
    await bot.consume();
    await sleep(200);
  }
}
console.log('Food now:', bot.food, 'Health now:', bot.health);

// 2. Check all teammates
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}`);
}

// 3. Check base chest
const chestPos = new Vec3(293, 72, -57);
const chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Chest contents:', JSON.stringify(chest));

// 4. Check base furnaces
const furnaces = bot.findBlocks({ matching: b => b.name === 'furnace', maxDistance: 6, count: 5 });
for (const f of furnaces) {
  try {
    const fw = await bot.openFurnace(bot.blockAt(f));
    console.log(`Furnace at ${lib.fmt(f)}: in=${fw.inputItem()?.name}x${fw.inputItem()?.count} fuel=${fw.fuelItem()?.name}x${fw.fuelItem()?.count} out=${fw.outputItem()?.name}x${fw.outputItem()?.count}`);
    if (fw.outputItem()) {
      await fw.takeOutput();
      console.log(`Took ${fw.outputItem().count} ${fw.outputItem().name}!`);
    }
    await fw.close();
  } catch (err) {
    console.log('Furnace error:', err.message);
  }
}

bot.chat(`delta: Hunger stabilized (food: ${bot.food}/20). Standing by at base to support iron armor crafting for Beta & Delta!`);
