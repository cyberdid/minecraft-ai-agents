// programs/131-check-base-and-coordinate.js
console.log('--- CHECK PLAYERS AND BASE CHEST ---');
console.log('Gamma pos:', lib.fmt(bot.entity.position));

// 1. Check all player positions
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Player ${name} at: ${lib.fmt(p.entity.position)} dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  } else if (name !== 'gamma') {
    console.log(`Player ${name} not in render distance (might be in Nether)`);
  }
}

// 2. Walk to base doorway at (294, 72, -52)
console.log('Navigating to base exterior (294, 72, -52)...');
bot.pathfinder.stop();
bot.clearControlStates();
await sleep(200);

try {
  await lib.goTo(294, 72, -52, 1, { timeoutMs: 20000 });
} catch (e) {
  console.log('goTo note:', e.message);
  await lib.goToXZ(294, -52, { timeoutMs: 15000 });
}

console.log('At base exterior:', lib.fmt(bot.entity.position));

// 3. Step inside base to (294, 72, -56)
try {
  await lib.goTo(294, 72, -56, 1, { timeoutMs: 15000 });
} catch (e) {
  console.log('Step inside note:', e.message);
}

// 4. Open base chest at (293, 72, -57)
const chestPos = new Vec3(293, 72, -57);
const chestBlock = bot.blockAt(chestPos);
console.log('Chest at (293, 72, -57):', chestBlock ? chestBlock.name : 'null');

if (chestBlock && chestBlock.name.includes('chest')) {
  try {
    const chest = await bot.openContainer(chestBlock);
    const items = chest.containerItems();
    console.log('Base Chest contains:', items.map(i => `${i.name}x${i.count}`).join(', '));
    
    // Withdraw food, armor, shield, cobblestone, iron, gold
    for (const item of items) {
      const n = item.name;
      if (
        n.includes('cooked') || n.includes('bread') || n.includes('beef') || n.includes('pork') ||
        n.includes('iron') || n.includes('shield') || n.includes('golden') ||
        n.includes('cobblestone') || n.includes('torch') || n.includes('water_bucket')
      ) {
        try {
          await chest.withdraw(item.type, null, item.count);
          console.log(`Withdrew ${n} x ${item.count}`);
        } catch (err) {
          console.log(`Withdraw error ${n}:`, err.message);
        }
      }
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

console.log('Inventory after chest:', JSON.stringify(lib.inv()));
await lib.equipArmor();

// Equip stone_sword
const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

// Re-check nearby players
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== 'gamma' && p.entity) {
    console.log(`Player ${name} now at: ${lib.fmt(p.entity.position)} dist: ${p.entity.position.distanceTo(bot.entity.position).toFixed(1)}m`);
  }
}

bot.chat(`gamma geared with stone sword & pickaxe, checked base. Preparing Nether advance to (44, 65, -133)!`);
