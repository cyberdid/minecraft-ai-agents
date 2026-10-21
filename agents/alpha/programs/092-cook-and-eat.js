// programs/092-cook-and-eat.js
// Inspect both furnaces, clear any stuck items, smelt beef & chicken, and eat!

const f1Pos = new Vec3(295, 72, -55);
const f2Pos = new Vec3(295, 72, -57);

console.log('Crafting planks for fuel...');
if (lib.count('*_planks') < 4 && lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 4);
}

for (const p of [f1Pos, f2Pos]) {
  const bl = bot.blockAt(p);
  console.log(`Furnace at ${p}:`, bl?.name);
  if (bl && bl.name === 'furnace') {
    try {
      const f = await bot.openFurnace(bl);
      console.log(`Slots for ${p}: input=${f.inputItem()?.name} x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name} x${f.fuelItem()?.count}, output=${f.outputItem()?.name} x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
      }
      f.close();
    } catch (e) {
      console.log(`Error checking furnace ${p}:`, e.message);
    }
  }
}

// Now smelt beef in furnace 1
console.log('Smelting beef in furnace...');
try {
  await lib.smelt('beef', 'oak_planks', 1);
  console.log('Beef smelted!');
} catch (e) {
  console.log('Beef smelt error:', e.message);
}

// Smelt chicken in furnace 2 or 1
if (lib.count('chicken') > 0) {
  console.log('Smelting chicken in furnace...');
  try {
    await lib.smelt('chicken', 'oak_planks', 1);
    console.log('Chicken smelted!');
  } catch (e) {
    console.log('Chicken smelt error:', e.message);
  }
}

// Eat cooked food
console.log('Eating cooked food...');
await lib.eat();
if (lib.count('cooked_beef') > 0 || lib.count('cooked_chicken') > 0) {
  await lib.eat();
}

console.log('Health after eating:', bot.health, '| food:', bot.food, '| inv:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Cooked and ate! Health: ${Math.round(bot.health)}/20, Food: ${bot.food}/20.`);
