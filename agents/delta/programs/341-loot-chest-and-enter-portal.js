// programs/341-loot-chest-and-enter-portal.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Walk into base at (294, 72, -56)
console.log('Walking to base chest at (293, 72, -57)...');
try {
  await lib.goTo(294, 72, -56, 1, { timeoutMs: 12000 });
} catch (e) {
  console.log('goTo base note:', e.message);
}

// 2. Open chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log(`Chest contains ${items.length} item types:`);
    for (const item of items) {
      console.log(`  ${item.name} x${item.count}`);
    }

    // Withdraw cobblestone, food, armor, shield, torches
    for (const item of items) {
      const n = item.name;
      if (n === 'cobblestone' || n === 'cooked_beef' || n === 'cooked_porkchop' || n === 'cooked_mutton' || n === 'bread' || n === 'apple' || n.includes('iron_') || n === 'shield' || n === 'torch') {
        try {
          await chest.withdraw(item.type, null, item.count);
          console.log(`Withdrew ${n} x${item.count}`);
        } catch (e) {
          console.log(`Withdraw ${n} error:`, e.message);
        }
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest interaction error:', e.message);
  }
}

// 3. Equip any armor found
try {
  await lib.equipArmor();
  console.log('Equipped available armor!');
} catch (e) {
  console.log('Equip armor note:', e.message);
}

// Equip stone sword in main hand, shield in offhand if available
const sword = bot.inventory.items().find(i => i.name === 'stone_sword');
if (sword) await bot.equip(sword, 'hand');
const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield) {
  try { await bot.equip(shield, 'off-hand'); console.log('Shield equipped in offhand!'); } catch (e) {}
}

console.log('Inventory before portal:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}

// 4. Move to Nether Portal at (298, 72, -54)
console.log('Moving into Nether Portal...');
try {
  await lib.goTo(297, 72, -54, 1, { timeoutMs: 10000 });
} catch (e) {
  console.log('goTo portal note:', e.message);
}

// Walk inside portal block (298.5, 73.0, -53.5)
bot.setControlState('forward', true);
bot.setControlState('jump', true);
await sleep(2000);
bot.clearControlStates();

console.log('Waiting for Nether dimension change...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension, 'pos:', lib.fmt(bot.entity.position));
if (String(bot.game.dimension).includes('nether')) {
  bot.chat(`delta: Entered Nether! Pos ${lib.fmt(bot.entity.position)} with ${lib.count('cobblestone')} cobble & stone sword. Sprinting to Spawner!`);
} else {
  console.log('Did not reach Nether within wait window.');
}
