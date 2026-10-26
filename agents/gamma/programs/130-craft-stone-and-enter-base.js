// programs/130-craft-stone-and-enter-base.js
console.log('--- CRAFT STONE TOOLS & ACCESS BASE ---');
console.log('Pos:', lib.fmt(bot.entity.position));

// 1. Craft stone_sword and stone_pickaxe
// Table is at (287, 74, -33) or base
console.log('Crafting stone_sword and stone_pickaxe...');
await lib.craft('stone_sword', 1);
await lib.craft('stone_pickaxe', 1);
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));

// Equip sword
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// 2. Navigate to base exterior (294, 72, -52)
console.log('Moving towards base (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1, { timeoutMs: 25000 });
console.log('Outside base at:', lib.fmt(bot.entity.position));

// Check blocks around doorway (294, 72, -54)
for (let y = 72; y <= 74; y++) {
  for (let z = -53; z >= -56; z--) {
    const b = bot.blockAt(new Vec3(294, y, z));
    console.log(`Block at (294, ${y}, ${z}): ${b ? b.name : 'null'}`);
  }
}

// 3. Step inside doorway to (294, 72, -56)
console.log('Entering base...');
await lib.goTo(294, 72, -56, 1, { timeoutMs: 15000 });
console.log('Inside base at:', lib.fmt(bot.entity.position));

// 4. Check chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
if (chestBlock && chestBlock.name.includes('chest')) {
  console.log('Opening base chest...');
  const chest = await bot.openContainer(chestBlock);
  const items = chest.containerItems();
  console.log('Chest contents:', items.map(i => `${i.name}x${i.count}`).join(', '));
  for (const item of items) {
    const n = item.name;
    if (n.includes('cooked') || n.includes('bread') || n.includes('beef') || n.includes('pork') ||
        n.includes('iron') || n.includes('shield') || n.includes('golden') || n.includes('cobblestone')) {
      try {
        await chest.withdraw(item.type, null, item.count);
        console.log(`Withdrew ${n} x ${item.count}`);
      } catch (e) {
        console.log(`Withdraw ${n} error:`, e.message);
      }
    }
  }
  chest.close();
}

console.log('Gamma inv now:', JSON.stringify(lib.inv()));
await lib.equipArmor();

// Check if Alpha is here
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Player ${name} nearby at: ${lib.fmt(p.entity.position)}`);
  }
}
