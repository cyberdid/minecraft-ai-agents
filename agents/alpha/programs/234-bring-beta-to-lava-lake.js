// programs/234-bring-beta-to-lava-lake.js
console.log('=== Program 234: Meet Beta & Quench Obsidian ===');
console.log('Alpha start pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

// 1. Walk directly to Beta at (297, 20, 21)
console.log('Moving to Beta at (297, 20, 21)...');
try {
  await lib.goTo(297, 20, 21, 2, { dig: true, timeoutMs: 25000 });
  console.log('Reached Beta! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Move to Beta note:', e.message);
}

// 2. Chat with Beta
bot.chat('beta: I am right next to you! The massive lava lake is 12m west at (287, 18, 8). Either toss me the bucket and diamond pickaxe, or follow me to (287, 19, 8) and run makeObsidianSafe(10)!');

// 3. Pickup any items tossed by Beta
await sleep(2000);
await lib.pickup(6);

// Eat any food
for (const f of ['cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'bread']) {
  if (lib.count(f) > 0) {
    console.log(`Eating ${f}...`);
    try {
      if (typeof safeEat === 'function') await safeEat(f);
      else await lib.eat();
    } catch (e) {}
  }
}

// 4. If Alpha now holds diamond_pickaxe & water_bucket, run makeObsidianSafe!
if (lib.count('diamond_pickaxe') > 0 && lib.count('water_bucket') > 0 && lib.count('obsidian') < 10) {
  console.log('Alpha has diamond pickaxe and bucket! Running makeObsidianSafe(10)...');
  try {
    const res = await makeObsidianSafe(10);
    console.log('makeObsidianSafe result:', JSON.stringify(res));
    bot.chat(`beta: 10 obsidian mined! Count: ${lib.count('obsidian')}. Returning to base portal!`);
  } catch (err) {
    console.log('makeObsidianSafe error:', err.message);
  }
} else {
  // Move back to lava edge at (287, 19, 8) to guide Beta
  console.log('Moving back to lava edge (287, 19, 8)...');
  try {
    await lib.goTo(287, 19, 8, 2, { dig: true, timeoutMs: 20000 });
  } catch (e) {}
}

console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Obsidian on Alpha:', lib.count('obsidian'));
