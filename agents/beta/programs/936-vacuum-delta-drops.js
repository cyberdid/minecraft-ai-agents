console.log('=== Program 936: Vacuum Delta Drops and Track Pearls ===');
globalThis.isProgramCancelled = isCancelled;

bot.chat(`Beta: 8 Ender Pearls secured! Vacuuming barter drops with Delta & Gamma...`);

// Wait 5 seconds for the barter that was initiated at 17:01:01 to drop
await sleep(5000);
await lib.pickup(6.0);

console.log('Current Pearls:', lib.count('ender_pearl'));

// Let's do a 15-second loop watching for more drops from Delta / Gamma barters
const start = Date.now();
while (Date.now() - start < 15000 && !isCancelled()) {
  await sleep(2000);
  await lib.pickup(6.0);
  const pearls = lib.count('ender_pearl');
  if (pearls >= 12) {
    bot.chat(`Beta: MILESTONE 9 REACHED! We have ${pearls} Ender Pearls!`);
    console.log(`MILESTONE 9 REACHED! We have ${pearls} Ender Pearls!`);
    break;
  }
}

const finalPearls = lib.count('ender_pearl');
console.log('Final Ender Pearls held by Beta:', finalPearls);
console.log('Final Inventory:', JSON.stringify(lib.inv()));

return {
  pearls: finalPearls,
  inv: lib.inv(),
  hp: bot.health,
  food: bot.food
};
