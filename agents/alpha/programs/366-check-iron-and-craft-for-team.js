// programs/366-check-iron-and-craft-for-team.js
console.log('=== Program 366: Check Iron & Armor for Team ===');

console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Check all base furnaces
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

let totalIronIngotsSmelted = 0;
for (const fp of furnacePositions) {
  const b = bot.blockAt(fp);
  if (b && b.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(b);
      const inp = f.inputItem();
      const fuel = f.fuelItem();
      const out = f.outputItem();
      console.log(`Furnace at ${lib.fmt(fp)}:`);
      console.log(`  Input: ${inp ? `${inp.name}x${inp.count}` : 'empty'}`);
      console.log(`  Fuel: ${fuel ? `${fuel.name}x${fuel.count}` : 'empty'}`);
      console.log(`  Output: ${out ? `${out.name}x${out.count}` : 'empty'}`);
      if (out && out.name === 'iron_ingot') {
        console.log(`Taking ${out.count} iron_ingot from furnace...`);
        await f.takeOutput();
        totalIronIngotsSmelted += out.count;
      }
      f.close();
    } catch (e) {
      console.log(`Error checking furnace at ${lib.fmt(fp)}:`, e.message);
    }
  }
}

// 2. Check chest at (293, 72, -57)
let chest = {};
try {
  chest = await lib.chestContents(293, 72, -57);
  console.log('Chest contents:', JSON.stringify(chest));
} catch (e) {
  console.log('Chest read error:', e.message);
}

// 3. Check teammates
console.log('Teammates check:');
for (const name of ['beta', 'gamma', 'delta']) {
  const p = bot.players[name];
  if (p && p.entity) {
    console.log(`  ${name}: at ${lib.fmt(p.entity.position)}`);
  } else {
    console.log(`  ${name}: not in loaded view or offline`);
  }
}

console.log('Alpha inventory:', JSON.stringify(lib.inv()));
bot.chat(`team: Alpha checked base. Iron in inventory: ${lib.count('iron_ingot')}, chest iron: ${chest.iron_ingot || 0}`);
