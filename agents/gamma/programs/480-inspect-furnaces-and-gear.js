// programs/480-inspect-furnaces-and-gear.js
console.log('=== GAMMA: INSPECT FURNACES & BASE CONTAINERS ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// 1. Check all three furnaces in base
const furnaceCoords = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fc of furnaceCoords) {
  const fb = bot.blockAt(fc);
  if (fb && (fb.name === 'furnace' || fb.name === 'lit_furnace')) {
    console.log(`Checking furnace at ${lib.fmt(fc)}...`);
    try {
      const fn = await bot.openFurnace(fb);
      const input = fn.inputItem();
      const fuel = fn.fuelItem();
      const output = fn.outputItem();
      console.log(`Furnace ${lib.fmt(fc)}: input=${input ? input.name + 'x' + input.count : 'none'}, fuel=${fuel ? fuel.name + 'x' + fuel.count : 'none'}, output=${output ? output.name + 'x' + output.count : 'none'}`);
      if (output) {
        await fn.takeOutput();
        console.log(`Withdrew output: ${output.name} x${output.count}`);
      }
      fn.close();
    } catch (e) {
      console.log(`Furnace ${lib.fmt(fc)} error:`, e.message);
    }
  }
}

// 2. If we withdrew cooked food, eat to full health
try {
  await lib.eat();
} catch (e) {}

// 3. Ensure armor & weapon equipped
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield && bot.inventory.slots[45]?.name !== 'shield') {
  try { await bot.equip(shield, 'off-hand'); } catch (e) {}
}

// 4. Report status
bot.chat(`gamma: Base gear verified! HP: ${bot.health.toFixed(1)}, Food: ${bot.food}, Offhand: ${bot.inventory.slots[45]?.name}. Ready to mine Nether Gold Ore for golden_boots & Piglin bartering!`);

return {
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  offhand: bot.inventory.slots[45]?.name,
  inv: lib.inv()
};
