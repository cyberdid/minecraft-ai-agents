// programs/403-deposit-ingots-for-boots.js
console.log('=== Step: Deposit 2 iron ingots in chest for team armor ===');

const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb && lib.count('iron_ingot') > 0) {
  try {
    const chest = await bot.openChest(cb);
    const ingot = bot.inventory.items().find(i => i.name === 'iron_ingot');
    if (ingot) {
      await chest.deposit(ingot.type, null, ingot.count);
      console.log(`Deposited ${ingot.count} iron ingots into chest!`);
    }
    chest.close();
  } catch (e) {
    console.log('Deposit error:', e.message);
  }
}

console.log('Beta inventory now:', JSON.stringify(lib.inv()));
bot.chat('beta: Deposited 2 iron ingots in chest (293, 72, -57)! Alpha/Delta, use them with your ingots to craft iron_boots!');
