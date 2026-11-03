// programs/729-craft-and-advance-stronghold.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 729: CRAFT & ADVANCE TO STRONGHOLD ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

// Vacuum drops in room
try { await lib.pickup(6.0); } catch (e) {}

// Check all players
console.log('--- Players in Render ---');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`- ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
}

// Check Base Chest
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('--- Base Chest Items ---');
    for (const it of items) {
      if (['blaze_powder', 'blaze_rod', 'ender_pearl', 'ender_eye', 'iron_sword', 'iron_pickaxe', 'shield'].includes(it.name)) {
        console.log(`  * ${it.name} x${it.count}`);
      }
    }

    // Withdraw blaze_powder / blaze_rod
    const bp = items.find(i => i.name === 'blaze_powder');
    if (bp) {
      console.log(`Withdrawing ${bp.count} blaze_powder...`);
      await chest.withdraw(bp.type, null, bp.count);
    }
    const br = items.find(i => i.name === 'blaze_rod');
    if (br) {
      console.log(`Withdrawing ${br.count} blaze_rod...`);
      await chest.withdraw(br.type, null, br.count);
    }
    const ep = items.find(i => i.name === 'ender_pearl');
    if (ep) {
      console.log(`Withdrawing ${ep.count} ender_pearl...`);
      await chest.withdraw(ep.type, null, ep.count);
    }

    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Craft blaze_rod if any
if (lib.count('blaze_rod') > 0) {
  try {
    const r = lib.count('blaze_rod');
    await lib.craft('blaze_powder', r * 2);
    console.log(`Crafted ${r * 2} blaze_powder!`);
  } catch (e) {}
}

// Craft ender_eye if possible
const powder = lib.count('blaze_powder');
const pearls = lib.count('ender_pearl');
console.log(`Craft check: blaze_powder=${powder}, ender_pearl=${pearls}`);

if (powder > 0 && pearls > 0) {
  const toCraft = Math.min(powder, pearls);
  console.log(`Crafting ${toCraft} ender_eye...`);
  try {
    await lib.craft('ender_eye', toCraft);
    console.log(`SUCCESS! Crafted ${toCraft} ender_eye! Total in inv: ${lib.count('ender_eye')}`);
    bot.chat(`delta: Milestone 10: Crafted ${toCraft} ender_eye! Total held: ${lib.count('ender_eye')}!`);
  } catch (e) {
    console.log('Craft ender_eye error:', e.message);
  }
}

// Check team eyes status
console.log('\n=== Team Eye Status ===');
console.log('Delta holds:', lib.count('ender_eye'), 'ender_eye');
const beta = bot.players['beta'];
if (beta && beta.entity) {
  console.log('Beta held:', beta.entity.heldItem?.name);
}

// Equip best armor and gear
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('Delta Inv:', JSON.stringify(lib.inv()));
return {
  eyes: lib.count('ender_eye'),
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
