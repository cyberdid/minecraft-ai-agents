console.log('=== DELTA: INSPECT FURNACES & FOOD ===');
console.log(`Delta Pos: ${lib.fmt(bot.entity.position)}, Food: ${bot.food}`);

const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

let totalFoodWithdrawn = 0;

for (let i = 0; i < furnacePositions.length; i++) {
  const fp = furnacePositions[i];
  const block = bot.blockAt(fp);
  console.log(`Furnace ${i + 1} at ${lib.fmt(fp)}: ${block ? block.name : 'null'}`);
  if (block && block.name.includes('furnace')) {
    try {
      const furnace = await bot.openFurnace(block);
      const input = furnace.inputItem();
      const fuel = furnace.fuelItem();
      const output = furnace.outputItem();
      console.log(`  Input: ${input ? `${input.name} x${input.count}` : 'empty'}`);
      console.log(`  Fuel: ${fuel ? `${fuel.name} x${fuel.count}` : 'empty'}`);
      console.log(`  Output: ${output ? `${output.name} x${output.count}` : 'empty'}`);

      if (output && (output.name.startsWith('cooked_') || output.name.includes('beef') || output.name.includes('porkchop') || output.name.includes('mutton') || output.name.includes('chicken'))) {
        await furnace.takeOutput();
        console.log(`  Withdrew ${output.name} x${output.count}!`);
        totalFoodWithdrawn += output.count;
      }
      furnace.close();
    } catch (e) {
      console.log(`  Furnace ${i + 1} error:`, e.message);
    }
  }
}

// Check inventory for food and eat
const foodItem = bot.inventory.items().find(i => i.name.startsWith('cooked_') || i.name === 'bread' || i.name === 'apple');
if (foodItem) {
  console.log(`Eating ${foodItem.name}...`);
  await bot.equip(foodItem.type, 'hand');
  await bot.consume();
  if (bot.food < 18 && bot.inventory.items().find(i => i.name === foodItem.name)) {
    await bot.consume();
  }
}

console.log(`Delta status: Food: ${bot.food}/20, HP: ${bot.health}/20`);
return {
  pos: bot.entity.position,
  food: bot.food,
  hp: bot.health,
  inv: lib.inv()
};
