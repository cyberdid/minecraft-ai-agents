// programs/285-craft-stone-tools-and-check-furnaces.js
console.log('=== CRAFT STONE TOOLS & CHECK FURNACES ===');
console.log('Current pos:', lib.fmt(bot.entity.position));

// 1. Inspect furnaces for smelted items or fuel
const furnacePositions = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -57),
  new Vec3(286, 72, -62)
];

for (const fp of furnacePositions) {
  const block = bot.blockAt(fp);
  if (!block || !block.name.includes('furnace')) {
    console.log(`No furnace at ${lib.fmt(fp)} (found ${block ? block.name : 'null'})`);
    continue;
  }
  try {
    console.log(`Opening furnace at ${lib.fmt(fp)}...`);
    await lib.goTo(fp.x, fp.y, fp.z, 2, { timeoutMs: 4000 });
    const furnace = await bot.openFurnace(block);
    const input = furnace.inputItem();
    const fuel = furnace.fuelItem();
    const output = furnace.outputItem();
    console.log(`Furnace at ${lib.fmt(fp)}: input=${input ? `${input.name}x${input.count}` : 'none'}, fuel=${fuel ? `${fuel.name}x${fuel.count}` : 'none'}, output=${output ? `${output.name}x${output.count}` : 'none'}`);
    
    // Take output if any
    if (output) {
      console.log(`Taking ${output.count}x ${output.name} from furnace...`);
      await furnace.takeOutput();
    }
    furnace.close();
  } catch (e) {
    console.log(`Furnace at ${lib.fmt(fp)} error:`, e.message);
  }
}

// 2. Locate crafting table
const tableBlocks = bot.findBlocks({
  matching: b => b && b.name === 'crafting_table',
  maxDistance: 10,
  count: 3
});
console.log('Crafting tables found:', tableBlocks.map(p => lib.fmt(p)));

// 3. Craft sticks and stone tools
console.log('Inventory before crafting:', JSON.stringify(lib.inv()));
if (lib.count('stick') < 6 && lib.count('*_planks') >= 2) {
  console.log('Crafting sticks...');
  await lib.craft('stick', 4);
}

if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting stone_pickaxe...');
  await lib.craft('stone_pickaxe', 1);
}

if (lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  console.log('Crafting stone_sword...');
  await lib.craft('stone_sword', 1);
}

if (lib.count('cobblestone') >= 3 && lib.count('stick') >= 2) {
  console.log('Crafting stone_axe...');
  await lib.craft('stone_axe', 1);
}

await lib.equipWeapon();

// Check team chat and other players
console.log('\n--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}`);
  } else {
    console.log(`Player ${name}: no entity nearby`);
  }
}

console.log('\nInventory after crafting:', JSON.stringify(lib.inv()));
console.log('Tools:', JSON.stringify(lib.tools()));
bot.chat(`gamma armed with stone tools at base. Inventory: ${JSON.stringify(lib.inv())}`);
