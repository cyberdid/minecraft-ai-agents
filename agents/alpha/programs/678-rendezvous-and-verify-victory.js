// programs/678-rendezvous-and-verify-victory.js
console.log('=== Program 678: Rendezvous with Beta & Milestone 8 Victory ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

const chestPos = new Vec3(293, 72, -57);

// Monitor chest for up to 60 seconds until Beta deposits rods
const start = Date.now();
let verifiedRods = 0;

while (Date.now() - start < 60000 && verifiedRods < 8 && !isCancelled()) {
  const chestBlock = bot.blockAt(chestPos);
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const rodsItem = chest.containerItems().find(i => i.name === 'blaze_rod');
      verifiedRods = rodsItem ? rodsItem.count : 0;
      console.log(`Checking chest... Blaze Rods found: ${verifiedRods}`);
      await chest.close();
      if (verifiedRods >= 8) break;
    } catch (e) {
      // Chest might be in use by Beta
      await sleep(1000);
    }
  }
  await sleep(2500);
}

console.log(`Final verified Blaze Rods in Base Chest: ${verifiedRods}`);

if (verifiedRods >= 8) {
  bot.chat(`alpha: MILESTONE 8 OFFICIALLY COMPLETE! Verified ${verifiedRods} Blaze Rods in Base Chest!`);
  
  // Withdraw 8 blaze rods to craft blaze powder
  console.log('Withdrawing 8 blaze rods to craft blaze powder...');
  const chestBlock = bot.blockAt(chestPos);
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const rodItem = chest.containerItems().find(i => i.name === 'blaze_rod');
      if (rodItem) {
        await chest.withdraw(rodItem.type, null, Math.min(8, rodItem.count));
      }
      await chest.close();
    } catch (e) {}
  }

  // Craft blaze powder
  const rodsInInv = lib.count('blaze_rod');
  console.log(`Alpha holding ${rodsInInv} Blaze Rods. Crafting blaze_powder...`);
  if (rodsInInv > 0) {
    try {
      await lib.craft('blaze_powder', rodsInInv * 2);
      console.log(`Crafted blaze_powder! Total powder: ${lib.count('blaze_powder')}`);
      bot.chat(`alpha: Crafted ${lib.count('blaze_powder')} Blaze Powder for Eyes of Ender!`);
      // Deposit powder back in chest
      await lib.deposit({ blaze_powder: 'all' }, 293, 72, -57);
    } catch (e) {
      console.log('Crafting note:', e.message);
    }
  }
} else {
  // Check if Beta or Alpha has them in inventory
  console.log('Chest rods < 8, checking local inventory:', lib.inv());
}

console.log('=== Program 678 Finished ===');
console.log('Status: Pos:', lib.fmt(bot.entity.position), 'Inv:', lib.inv(), 'Chest rods:', verifiedRods);
