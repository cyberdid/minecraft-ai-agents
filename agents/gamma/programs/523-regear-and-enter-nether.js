// programs/523-regear-and-enter-nether.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 523: REGEAR & ENTER NETHER ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

// Step 1: Check base chest contents
try {
  const contents = await lib.chestContents(293, 72, -57);
  console.log('Base Chest (293, 72, -57) contents:', JSON.stringify(contents));

  // Withdraw food if available
  for (const fn of ['cooked_beef', 'cooked_porkchop', 'cooked_mutton', 'cooked_chicken', 'bread', 'apple']) {
    if (contents && contents[fn] > 0) {
      try {
        const amt = Math.min(contents[fn], 12);
        await lib.withdraw({ [fn]: amt }, 293, 72, -57);
        console.log(`Withdrew ${amt} of ${fn}`);
      } catch (e) {}
      break;
    }
  }

  // Withdraw cobblestone if available and needed
  if (contents && contents.cobblestone > 0 && lib.count('cobblestone') < 16) {
    try {
      const amt = Math.min(contents.cobblestone, 16 - lib.count('cobblestone'));
      await lib.withdraw({ cobblestone: amt }, 293, 72, -57);
      console.log(`Withdrew ${amt} cobblestone`);
    } catch (e) {}
  }

  // Withdraw gold ingots if available
  if (contents && contents.gold_ingot > 0) {
    try {
      const amt = Math.min(contents.gold_ingot, 8);
      await lib.withdraw({ gold_ingot: amt }, 293, 72, -57);
      console.log(`Withdrew ${amt} gold_ingot`);
    } catch (e) {}
  }
} catch (e) {
  console.log('Chest access note:', e.message);
}

// Step 2: Ensure quickRegear (golden_boots on feet, shield in offhand, sword equipped)
await globalThis.quickRegear({ cobble: 4 });

console.log('Inventory before entry:', lib.inv());
console.log('Feet slot:', bot.inventory.slots[8]?.name);
console.log('Offhand slot:', bot.inventory.slots[45]?.name);

// Verify golden boots are strictly equipped
if (bot.inventory.slots[8]?.name !== 'golden_boots') {
  const gb = bot.inventory.items().find(i => i.name === 'golden_boots');
  if (gb) {
    await bot.equip(gb, 'feet');
    console.log('Equipped golden_boots explicitly!');
  }
}

// Step 3: Fast enter Nether Portal
bot.chat('gamma: Entering Nether portal with full HP and golden_boots equipped!');
console.log('Entering Nether Portal via preloaded helper...');
const portalRes = await globalThis.enterNetherPortal();
console.log('Portal transit result:', JSON.stringify(portalRes));

bot.chat(`gamma: In the_nether at ${lib.fmt(bot.entity.position)}! HP: ${bot.health}/20, Food: ${bot.food}/20.`);

return {
  dimension: bot.game.dimension,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food,
  goldenBoots: bot.inventory.slots[8]?.name === 'golden_boots',
  inv: lib.inv()
};
