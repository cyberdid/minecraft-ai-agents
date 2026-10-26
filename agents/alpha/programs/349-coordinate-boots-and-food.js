// programs/349-coordinate-boots-and-food.js
console.log('=== Program 349: Coordinate Final Iron & Food ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// Teammates status
for (const [name, p] of Object.entries(bot.players)) {
  if (name === 'alpha') continue;
  if (p.entity) {
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name}`);
  }
}

bot.chat('beta: Beta, bring the 4 raw iron to base furnaces! 4 iron ingots will complete iron_boots!');

// Check base chest
const chestPos = new Vec3(293, 72, -57);
try {
  const contents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
  console.log('Base chest contents:', JSON.stringify(contents));
  if (contents.iron_ingot >= 4) {
    await lib.withdraw({ iron_ingot: 4 }, chestPos.x, chestPos.y, chestPos.z);
    await lib.craft('iron_boots', 1);
    await lib.equipArmor();
    console.log('CRAFTED AND EQUIPPED IRON BOOTS! Full iron armor complete!');
  }
} catch (e) {
  console.log('Chest note:', e.message);
}

console.log('Alpha status:', JSON.stringify(lib.status()));
