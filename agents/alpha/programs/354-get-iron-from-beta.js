// programs/354-get-iron-from-beta.js
console.log('=== Program 354: Get Iron from Beta / Chest ===');

bot.chat('beta: Beta, please toss 2 iron ingots to me or deposit them in chest (293, 72, -57) for boots!');

// Wait 4 seconds for Beta to deposit or toss
await sleep(4000);

// Check if any items dropped on floor nearby
await lib.pickup(6);

// Check chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest items:', JSON.stringify(contents));
  if (contents.iron_ingot > 0) {
    const need = Math.max(1, 4 - lib.count('iron_ingot'));
    console.log(`Withdrawing ${Math.min(need, contents.iron_ingot)} iron_ingots...`);
    await lib.withdraw({ iron_ingot: Math.min(need, contents.iron_ingot) }, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {
  console.log('Chest note:', e.message);
}

console.log('Alpha iron_ingots now:', lib.count('iron_ingot'));

// If we have 4+ ingots, craft iron_boots!
if (lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots!');
  await lib.craft('iron_boots', 1);
  await lib.equipArmor();
  console.log('SUCCESS! CRAFTED AND EQUIPPED IRON BOOTS!');
}

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha inv: ${JSON.stringify(lib.inv())}, gear: ${JSON.stringify(lib.tools())}`);
