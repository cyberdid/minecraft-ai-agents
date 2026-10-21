bot.chat("alpha: I have stone tools! Chopping 10 logs & 15 cobblestone, then heading to base (10, 67, -25).");

// 1. Collect logs with stone axe
console.log('Collecting logs with stone axe...');
try {
  await lib.collect('*_log', 10);
  console.log('Logs collected, count:', lib.count('*_log'));
} catch (e) {
  console.log('Log collect error:', e.message);
}

// 2. Collect cobblestone
console.log('Collecting stone with stone pickaxe...');
try {
  await lib.collect('stone', 16);
  console.log('Cobblestone collected, count:', lib.count('cobblestone'));
} catch (e) {
  console.log('Stone collect error:', e.message);
}

// 3. Craft extra tools for alpha if we have materials
try {
  await lib.craft('oak_planks', 12);
  await lib.craft('stick', 8);
  if (lib.count('cobblestone') >= 6) {
    await lib.craft('stone_pickaxe', 1); // for alpha
    await lib.craft('stone_axe', 1);     // for alpha
    console.log('Crafted extra stone tools for alpha!');
  }
} catch (e) {
  console.log('Crafting note:', e.message);
}

console.log('Current time check:', lib.time().secondsUntilNight, 's until night');
console.log('Returning to base at (10, 67, -25)...');
await lib.goTo(10, 67, -25, 3);
console.log('Arrived at base! Bot pos:', lib.fmt(bot.entity.position));
console.log('Inventory now:', JSON.stringify(lib.inv()));

bot.chat("alpha: I am back at base (10, 67, -25) with stone tools and materials!");
return lib.status();
