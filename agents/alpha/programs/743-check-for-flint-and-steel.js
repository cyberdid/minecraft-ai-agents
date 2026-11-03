// programs/743-check-for-flint-and-steel.js
console.log('=== Program 743: Check for Flint and Steel / Ignition Items ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Check Alpha inventory
console.log('Alpha inventory:');
for (const it of bot.inventory.items()) {
  console.log(` - ${it.name} x${it.count}`);
}

// 2. Walk to Base Chest at (293, 72, -57)
console.log('Checking Base Chest at (293, 72, -57)...');
try {
  await bot.pathfinder.goto(new goals.GoalNear(293.0, 72.0, -56.0, 1.0));
} catch (e) {
  try { await lib.goTo(293, 72, -56, 1.2, { timeoutMs: 5000 }); } catch (e2) {}
}

const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
let chestItems = [];
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    chestItems = chest.containerItems().map(i => ({ name: i.name, count: i.count }));
    console.log('Base Chest items:');
    for (const item of chestItems) {
      console.log(` - ${item.name} x ${item.count}`);
    }
    
    // Withdraw flint_and_steel, flint, iron_ingot, raw_iron, coal, fire_charge
    for (const item of chest.containerItems()) {
      if (
        item.name === 'flint_and_steel' ||
        item.name === 'flint' ||
        item.name === 'iron_ingot' ||
        item.name === 'raw_iron' ||
        item.name === 'fire_charge'
      ) {
        console.log(`Withdrawing ${item.name} x${item.count}...`);
        await chest.withdraw(item.type, null, item.count);
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 3. Check Furnaces at (295, 72, -54..-56)
for (const fz of [-54, -55, -56]) {
  const fPos = new Vec3(295, 72, fz);
  const fb = bot.blockAt(fPos);
  if (fb && fb.name === 'furnace') {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fPos)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
      }
      f.close();
    } catch (fe) {}
  }
}

// 4. Check if other teammates have flint_and_steel
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity && name !== bot.username) {
    console.log(`Teammate ${name} at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

bot.chat('alpha: Nether portal at (299, 73, -54) is unlit! Checking chest/furnaces for flint & steel to reignite!');

return {
  inv: lib.inv(),
  chest: chestItems
};
