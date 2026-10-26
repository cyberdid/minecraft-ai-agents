// programs/184-notify-beta-and-assist-obsidian.js
console.log('--- Notifying Beta & Assisting with Obsidian ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'Night in:', lib.time().secondsUntilNight);

// 1. Tell Beta water_bucket is in chest
bot.chat('beta: The water_bucket is in the base chest right now! Withdraw it and diamond_pickaxe for (333, 62, -78).');

// 2. Check chest for edible food
try {
  const chest = await lib.chestContents(293, 72, -57);
  console.log('Base chest contents:', JSON.stringify(chest));
  if (chest.cooked_beef && chest.cooked_beef > 0) {
    console.log('Withdrawing cooked_beef from chest...');
    await lib.withdraw({ cooked_beef: 1 }, 293, 72, -57);
  }
} catch (e) {
  console.log('Chest error:', e.message);
}

// Eat if we have food
if (lib.count('cooked_beef') > 0) {
  try {
    const beef = bot.inventory.items().find(i => i.name === 'cooked_beef');
    if (beef) {
      await bot.equip(beef, 'hand');
      bot.deactivateItem();
      bot.activateItem();
      await sleep(1800);
      bot.deactivateItem();
      console.log('Ate cooked beef! Food now:', bot.food);
    }
  } catch (e) {}
}

// 3. Check Beta's state
for (const [name, p] of Object.entries(bot.players)) {
  if (name !== bot.username && p && p.entity) {
    console.log(`Beta at ${lib.fmt(p.entity.position)}, held: ${p.entity.heldItem?.name}`);
  }
}

// 4. Head to lava pool at (333, 62, -78)
console.log('Traveling to lava pool at (333, 62, -78)...');
try {
  await lib.goTo(333, 63, -78, 3);
  console.log('Arrived at lava pool!');
} catch (e) {
  console.log('Travel note:', e.message);
  await lib.goToXZ(333, -78);
}

// 5. Check obsidian blocks at pool
const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 16 });
console.log(`Obsidian blocks currently at pool: ${obs.length}`);

console.log('Night in:', lib.time().secondsUntilNight, 's');
bot.chat(`beta: Standing by at lava pool. Obsidian count in pool: ${obs.length}. Let us gather 10!`);
