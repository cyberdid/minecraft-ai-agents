// programs/730-deposit-powder-for-beta.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 730: DEPOSIT BLAZE POWDER FOR BETA & CRAFT 22 EYES ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'Blaze powder held:', lib.count('blaze_powder'));

const chestPos = new Vec3(293, 72, -57);
const cb = bot.blockAt(chestPos);

if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const bp = bot.inventory.items().find(i => i.name === 'blaze_powder');
    if (bp) {
      console.log(`Depositing ${bp.count} blaze_powder into Base Chest for Beta...`);
      await chest.deposit(bp.type, null, bp.count);
      bot.chat(`delta: Deposited ${bp.count} Blaze Powder into Base Chest (293, 72, -57) for Beta to craft 22 Eyes!`);
    }

    // Check if chest has ender_pearls already
    const pearls = chest.containerItems().find(i => i.name === 'ender_pearl');
    if (pearls) {
      console.log(`Chest has ${pearls.count} ender_pearls!`);
    }

    chest.close();
  } catch (e) {
    console.log('Chest deposit error:', e.message);
  }
}

// Also toss 5 blaze_powder directly to Beta if nearby
const beta = bot.players['beta'];
if (beta && beta.entity && lib.count('blaze_powder') > 0) {
  try {
    await bot.lookAt(beta.entity.position.offset(0, 1.2, 0), true);
    await bot.toss(mcData.itemsByName.blaze_powder.id, null, lib.count('blaze_powder'));
    console.log('Tossed remaining blaze_powder directly to Beta!');
  } catch (e) {}
}

// Wait 5 seconds to let Beta craft
await sleep(5000);

// Check chest and inventory
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('=== Chest Items After Crafting Window ===');
    for (const it of items) {
      if (['blaze_powder', 'ender_pearl', 'ender_eye'].includes(it.name)) {
        console.log(`  * ${it.name} x${it.count}`);
      }
    }
    chest.close();
  } catch (e) {}
}

console.log('Delta Inventory:', JSON.stringify(lib.inv()));
return {
  deltaInv: lib.inv(),
  pos: bot.entity.position
};
