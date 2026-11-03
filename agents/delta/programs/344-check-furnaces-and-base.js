// programs/344-check-furnaces-and-base.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const pos of furnacePositions) {
  const block = bot.blockAt(pos);
  if (block && block.name.includes('furnace')) {
    console.log(`Checking furnace at ${lib.fmt(pos)} (${block.name})...`);
    try {
      const f = await bot.openFurnace(block);
      console.log(`  Input: ${f.inputItem()?.name} x${f.inputItem()?.count}`);
      console.log(`  Fuel: ${f.fuelItem()?.name} x${f.fuelItem()?.count}`);
      console.log(`  Output: ${f.outputItem()?.name} x${f.outputItem()?.count}`);
      
      // Take output if available
      if (f.outputItem()) {
        await f.takeOutput();
        console.log(`  Took output ${f.outputItem()?.name}!`);
      }
      f.close();
    } catch (e) {
      console.log(`  Furnace error at ${lib.fmt(pos)}:`, e.message);
    }
  } else {
    console.log(`No furnace at ${lib.fmt(pos)}: ${block?.name}`);
  }
}

// Check nearby players (e.g. Gamma)
const players = Object.values(bot.players).filter(p => p.username !== bot.username && p.entity);
for (const p of players) {
  console.log(`Player ${p.username} at ${lib.fmt(p.entity.position)}`);
}

// Check nearby dropped items
try {
  const drops = await lib.pickup(6);
  console.log('Picked up drops in base:', drops);
} catch (e) {}

console.log('Current Inventory:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
