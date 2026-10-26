// programs/384-eat-rotten-flesh-and-heal.js
console.log('=== Step: Eat rotten flesh to boost hunger and regenerate health ===');

while (lib.count('rotten_flesh') > 0 && bot.food < 20) {
  console.log(`Holding ${lib.count('rotten_flesh')} rotten_flesh, current food: ${bot.food}/20, health: ${bot.health}/20`);
  try {
    await bot.equip(mcData.itemsByName.rotten_flesh.id, 'hand');
    await bot.consume();
    console.log(`Consumed rotten_flesh. Food now: ${bot.food}/20, health: ${bot.health}/20`);
  } catch (e) {
    console.log('Consume error:', e.message);
    break;
  }
  await sleep(1000);
}

// Send team chat
bot.chat('beta: At base (294, 72, -55). Regenerating health. Who has iron ore/ingots for Beta and Delta armor?');

// Wait 10 seconds while monitoring health regeneration
for (let i = 0; i < 10; i++) {
  await sleep(1000);
  if (isCancelled()) break;
}

console.log(`Final status: food=${bot.food}/20, health=${bot.health}/20`);
