// programs/059-gather-wood-and-tools.js
console.log('gamma pos:', lib.fmt(bot.entity.position));

// 1. Check base chest for planks, sticks, or iron
const chest = await lib.chestContents(293, 72, -57);
console.log('Base chest:', JSON.stringify(chest));

let hasPlanks = false;
for (const [k, v] of Object.entries(chest)) {
  if (k.includes('planks') && v >= 4) {
    console.log(`Withdrawing ${k}...`);
    await lib.withdraw({ [k]: Math.min(v, 8) }, 293, 72, -57);
    hasPlanks = true;
    break;
  }
}

// 2. If no planks in chest, step outside and collect 4 logs
if (!hasPlanks && lib.count('*_planks') < 4) {
  console.log('Collecting logs outside base...');
  try {
    await lib.goThroughDoor(294, 72, -54, { close: false });
    await lib.collect('*_log', 4);
    await lib.craft('*_planks', 16);
    await lib.goThroughDoor(294, 72, -54, { close: true });
  } catch (e) {
    console.log('Wood collection note:', e.message);
  }
}

// 3. Craft sticks and stone tools
await lib.ensureTable();
if (lib.count('stick') < 4 && lib.count('*_planks') >= 2) {
  await lib.craft('stick', 4);
}

if (!lib.count('stone_pickaxe') && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}
if (!lib.count('stone_sword') && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  console.log('Crafting stone_sword...');
  await lib.craft('stone_sword', 1);
}
if (!lib.count('stone_axe') && lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting stone_axe...');
  await lib.craft('stone_axe', 1);
}

// 4. Check for iron_ingot to craft shield
if (chest.iron_ingot && lib.count('*_planks') >= 6) {
  await lib.withdraw({ iron_ingot: 1 }, 293, 72, -57);
  console.log('Crafting shield...');
  await lib.craft('shield', 1);
  await lib.equipArmor();
}

console.log('Gamma inventory now:', JSON.stringify(lib.inv()));
console.log('Gamma gear now:', JSON.stringify(lib.tools()));
bot.chat(`gamma re-geared at base: ${JSON.stringify(lib.tools())}. Inv: ${JSON.stringify(lib.inv())}`);
