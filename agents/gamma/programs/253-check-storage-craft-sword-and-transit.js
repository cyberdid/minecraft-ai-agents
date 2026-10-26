// programs/253-check-storage-craft-sword-and-transit.js
console.log('=== CHECK STORAGE, CRAFT SWORD & TRANSIT ===');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Inv:', JSON.stringify(lib.inv()));

// 1. Check base chest at (293, 72, -57)
try {
  const chest = await bot.openContainer(bot.blockAt(new Vec3(293, 72, -57)));
  console.log('\n--- BASE CHEST ---');
  for (const it of chest.items()) {
    console.log(` - ${it.name} x${it.count}`);
    if (['shield', 'stone_pickaxe', 'stone_sword', 'wooden_pickaxe', 'cobblestone', 'iron_ingot', 'stick', 'oak_planks', 'birch_planks'].includes(it.name)) {
      console.log(`Withdrawing ${it.name} x${it.count}...`);
      await chest.withdraw(it.type, null, it.count);
    }
  }
  await chest.close();
} catch (e) {
  console.log('Chest note:', e.message);
}

// 2. Craft stone_sword if we have cobble + stick
if (lib.count('stone_sword') === 0 && lib.count('cobblestone') >= 2 && lib.count('stick') >= 1) {
  console.log('Crafting stone_sword at table...');
  try {
    await lib.craft('stone_sword', 1);
    console.log('Stone sword crafted!');
  } catch (e) {
    console.log('Sword craft note:', e.message);
  }
}

// Equip weapon & armor
await lib.equipWeapon();
await lib.equipArmor();

console.log('Equipped: Mainhand:', bot.entity.equipment[0]?.name, 'Offhand:', bot.entity.equipment[1]?.name);
console.log('Inv now:', JSON.stringify(lib.inv()));

// 3. Step to Nether portal at (299.5, 73.0, -54.0)
console.log('Walking to Nether portal...');
try {
  await lib.walkTo(299.5, -54.0, 3000);
} catch (e) {
  try {
    await lib.goTo(299, 72, -52, 1, { timeoutMs: 6000 });
    bot.setControlState('jump', true);
    await lib.walkTo(299.5, -54.0, 2000);
    bot.clearControlStates();
  } catch (e2) {}
}

bot.clearControlStates();
console.log('Inside portal! Pos:', lib.fmt(bot.entity.position), 'Block:', bot.blockAt(bot.entity.position)?.name);
console.log('Standing still for Nether transit...');

const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);

if (String(bot.game.dimension).includes('nether')) {
  console.log('=== ARRIVED IN THE NETHER ===');
  await sleep(400);
  // Step out to bunker floor
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();

  console.log('Nether bunker pos:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Tools:', JSON.stringify(lib.tools()));
  console.log('Inv:', JSON.stringify(lib.inv()));

  bot.chat(`gamma in Nether at ${lib.fmt(bot.entity.position)}! Armed with ${bot.entity.equipment[0]?.name || 'tools'} and cobble x${lib.count('cobblestone')}.`);
}
