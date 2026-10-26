// programs/356-get-iron-from-team.js
console.log('=== Program 356: Complete Iron Boots from Team ===');

// Ask Delta & Beta to deposit ingots into chest
bot.chat('delta beta: Delta or Beta, please deposit 2 iron ingots into base chest (293, 72, -57) so Alpha can craft iron_boots!');

// Wait 6 seconds for team to deposit or toss
for (let i = 0; i < 3; i++) {
  if (isCancelled()) break;
  await sleep(2000);
  await lib.pickup(6);
}

// Check chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Chest items:', JSON.stringify(contents));
  if (contents.iron_ingot > 0) {
    const need = Math.max(1, 4 - lib.count('iron_ingot'));
    const take = Math.min(need, contents.iron_ingot);
    console.log(`Withdrawing ${take} iron_ingots from chest...`);
    await lib.withdraw({ iron_ingot: take }, chestPos.x, chestPos.y, chestPos.z);
  }
} catch (e) {
  console.log('Chest note:', e.message);
}

console.log('Alpha iron_ingots in inventory:', lib.count('iron_ingot'));

// Craft iron_boots
if (lib.count('iron_ingot') >= 4) {
  console.log('Crafting iron_boots at table (295, 72, -56)...');
  await lib.craft('iron_boots', 1);
  await lib.equipArmor();
  console.log('CRAFTED AND EQUIPPED IRON BOOTS!');
}

console.log('Alpha status:', JSON.stringify(lib.status()));
bot.chat(`team: Alpha inventory has ${lib.count('iron_ingot')} iron ingots. Armor: iron_helmet, iron_chestplate, iron_leggings.`);
