// programs/336-collect-furnaces-and-sleep.js
console.log('=== Program 336: Collect Furnaces & Sleep Protocol ===');

// Check the 3 furnaces safely
for (const p of [new Vec3(295, 72, -55), new Vec3(295, 72, -54), new Vec3(295, 72, -56)]) {
  const b = bot.blockAt(p);
  if (!b || b.name !== 'furnace') continue;
  try {
    const f = await bot.openFurnace(b);
    const out = f.outputItem();
    if (out) {
      console.log(`Furnace at ${lib.fmt(p)} output: ${out.name}x${out.count}`);
      await f.takeOutput();
      console.log(`Collected ${out.count} ${out.name}!`);
    }
    f.close();
  } catch (e) {
    console.log(`Furnace check note:`, e.message);
  }
}

console.log('Alpha inv after furnace check:', JSON.stringify(lib.inv()));

// Try crafting any armor pieces if we have iron
const iron = lib.count('iron_ingot');
if (iron >= 7 && !bot.inventory.items().some(i => i.name === 'iron_leggings')) {
  try { await lib.craft('iron_leggings', 1); } catch (e) {}
}
if (lib.count('iron_ingot') >= 5 && !bot.inventory.items().some(i => i.name === 'iron_helmet')) {
  try { await lib.craft('iron_helmet', 1); } catch (e) {}
}
if (lib.count('iron_ingot') >= 4 && !bot.inventory.items().some(i => i.name === 'iron_boots')) {
  try { await lib.craft('iron_boots', 1); } catch (e) {}
}

await lib.equipArmor();
console.log('Alpha gear now:', JSON.stringify(lib.tools()), 'wearing:', bot.inventory.items().filter(i => i.name.includes('iron_')).map(i => i.name));

// Wait for night and sleep
for (let i = 0; i < 20; i++) {
  if (isCancelled()) break;
  const t = lib.time();
  if (t.canSleep) {
    console.log(`canSleep=true at ${t.timeOfDay}! Sleeping in bed...`);
    try {
      await lib.sleepInBed();
      console.log('Sleeping!');
    } catch (e) {
      console.log('Sleep note:', e.message);
    }
    break;
  }
  console.log(`[t=${i*2}s] time=${t.timeOfDay}, secondsUntilNight=${t.secondsUntilNight}`);
  await sleep(2000);
}
