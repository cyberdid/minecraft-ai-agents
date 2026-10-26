// programs/201-check-furnaces-and-plan-iron.js
console.log('--- Inspecting Furnaces, Chest & Beta ---');

// 1. Inspect all 3 furnaces and collect outputs
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

let totalSmeltedIron = 0;
for (const pos of furnacePositions) {
  const block = bot.blockAt(pos);
  if (block && block.name === 'furnace') {
    try {
      const furn = await bot.openFurnace(block);
      const inItem = furn.inputItem();
      const fuelItem = furn.fuelItem();
      const outItem = furn.outputItem();
      console.log(`Furnace at ${lib.fmt(pos)}: input=${inItem?.name}x${inItem?.count}, fuel=${fuelItem?.name}x${fuelItem?.count}, output=${outItem?.name}x${outItem?.count}`);
      if (outItem) {
        console.log(`Taking output ${outItem.name} x${outItem.count}...`);
        await furn.takeOutput();
      }
      furn.close();
    } catch (e) {
      console.log(`Furnace error at ${lib.fmt(pos)}:`, e.message);
    }
  }
}

// 2. Check chest contents
const chestPos = new Vec3(293, 72, -57);
let chest = {};
try {
  chest = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest error:', e.message);
}

// 3. Check Beta's state
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p) {
    console.log(`Beta pos: ${p.entity ? lib.fmt(p.entity.position) : 'unknown'}, held: ${p.entity?.heldItem?.name}`);
  }
}

// 4. Report our inventory
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
console.log('Alpha iron_ingots:', lib.count('iron_ingot'), 'raw_iron:', lib.count('raw_iron'));

// 5. Check if we have 3 of any wool color (between chest and inventory)
const woolColors = ['white_wool', 'gray_wool', 'light_gray_wool', 'black_wool', 'brown_wool'];
for (const wc of woolColors) {
  const count = (chest[wc] || 0) + lib.count(wc);
  if (count >= 3) {
    console.log(`We have ${count} of ${wc}! Ready to craft Bed 2!`);
  }
}
