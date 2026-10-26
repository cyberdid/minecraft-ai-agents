// programs/243-reset-cooldown-and-transit.js
console.log('=== RESET COOLDOWN, CHECK STORAGE & TRANSIT ===');
console.log('Start pos:', lib.fmt(bot.entity.position));

// 1. Step completely away from the portal to clear cooldown
console.log('Walking 5m away from portal to base doorstep (294.5, 72, -54)...');
await lib.walkTo(294.5, -54.0, 3000);
bot.clearControlStates();
console.log('Away from portal! Pos:', lib.fmt(bot.entity.position));

// 2. Check base chest at (293, 72, -57) for gear
try {
  const chest = await bot.openContainer(bot.blockAt(new Vec3(293, 72, -57)));
  console.log('\n--- BASE CHEST CONTENTS ---');
  for (const it of chest.items()) {
    console.log(` - ${it.name} x${it.count}`);
    // Take useful survival items
    if (['shield', 'iron_sword', 'stone_sword', 'iron_pickaxe', 'stone_pickaxe', 'cobblestone', 'cooked_beef', 'bread'].includes(it.name)) {
      console.log(`Withdrawing ${it.name}...`);
      await chest.withdraw(it.type, null, it.count);
    }
  }
  await chest.close();
} catch (e) {
  console.log('Chest note:', e.message);
}

// 3. Check furnaces for smelted iron/food
for (const fp of [new Vec3(295, 72, -55), new Vec3(295, 72, -54)]) {
  const fb = bot.blockAt(fp);
  if (fb && fb.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(fb);
      if (f.outputItem()) {
        console.log(`Taking furnace output ${f.outputItem().name} x ${f.outputItem().count} from ${lib.fmt(fp)}...`);
        await f.takeOutput();
      }
      f.close();
    } catch (e) {}
  }
}

// Equip armor/shield/weapon if we got any
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('Current inv:', JSON.stringify(lib.inv()));
console.log('Waiting 2s for portalCooldown to fully clear on server...');
await sleep(2000);

// 4. Walk back to portal and enter center of block (299.5, 73.0, -54.0)
console.log('Approaching portal...');
await lib.goTo(299, 72, -52, 1, { timeoutMs: 8000 });

console.log('Stepping up into portal block...');
bot.setControlState('jump', true);
await lib.walkTo(299.5, -54.0, 3000);
bot.clearControlStates();

console.log('Inside portal! Standing still for transit...');
const t0 = Date.now();
while (!isCancelled() && !String(bot.game.dimension).includes('nether') && (Date.now() - t0 < 15000)) {
  await sleep(500);
}

console.log('Dimension now:', bot.game.dimension);
console.log('Pos now:', lib.fmt(bot.entity.position));

if (String(bot.game.dimension).includes('nether')) {
  console.log('TRANSIT SUCCESSFUL!');
  await sleep(400);
  console.log('Stepping out of portal to bunker floor...');
  await lib.walkTo(40.5, -5.0, 3000);
  bot.clearControlStates();

  console.log('Bunker pos:', lib.fmt(bot.entity.position));
  console.log('HP:', bot.health, 'Food:', bot.food);
  console.log('Inv:', JSON.stringify(lib.inv()));

  // Scan for dropped gear nearby
  const items = Object.values(bot.entities).filter(e => e.name === 'item' && e.position.distanceTo(bot.entity.position) < 32);
  console.log(`Found ${items.length} items nearby:`);
  for (const it of items) {
    console.log(` - Item entity ${it.id} at ${lib.fmt(it.position)} dist=${bot.entity.position.distanceTo(it.position).toFixed(1)}m`);
  }

  bot.chat(`gamma in Nether at ${lib.fmt(bot.entity.position)}! HP: ${bot.health}, Food: ${bot.food}`);
}
