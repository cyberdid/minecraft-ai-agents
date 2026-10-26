// programs/301-sleep-until-dawn.js
console.log('=== SLEEP UNTIL DAWN ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// 1. Check furnaces
const furnaces = [new Vec3(295, 72, -54), new Vec3(295, 72, -55), new Vec3(295, 72, -56), new Vec3(295, 72, -57)];
for (const p of furnaces) {
  const b = bot.blockAt(p);
  if (b && b.name.includes('furnace')) {
    try {
      const f = await bot.openFurnace(b);
      const out = f.outputItem();
      const fuel = f.fuelItem();
      const inp = f.inputItem();
      console.log(`Furnace at ${lib.fmt(p)}: in=${inp?.name}x${inp?.count}, fuel=${fuel?.name}x${fuel?.count}, out=${out?.name}x${out?.count}`);
      if (out) {
        console.log(`Taking ${out.count}x ${out.name} from furnace!`);
        await f.takeOutput();
      }
      await f.close();
    } catch (e) {}
  }
}

// 2. Check players
console.log('\n--- PLAYERS ---');
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity) {
    console.log(`Player ${name}: pos=${lib.fmt(p.entity.position)}, held=${p.entity.heldItem?.name || 'none'}`);
  } else {
    console.log(`Player ${name}: no entity`);
  }
}

// 3. Set spawn at bed
try {
  await lib.setSpawn();
  console.log('Spawn confirmed at base bed.');
} catch (e) {
  console.log('setSpawn note:', e.message);
}

// 4. Wait for sleep time (tick 12542)
console.log('Waiting for dusk/night to sleep...');
while (!isCancelled()) {
  const t = lib.time();
  if (t.canSleep || t.timeOfDay >= 12542 || t.timeOfDay > 23000) {
    console.log(`Time is ${t.timeOfDay}, sleeping in bed...`);
    try {
      await lib.sleepInBed();
      while (!isCancelled()) {
        await sleep(1000);
        const t2 = lib.time();
        if (!t2.night && t2.timeOfDay < 12000) {
          console.log(`Dawn arrived! timeOfDay=${t2.timeOfDay}`);
          break;
        }
      }
      break;
    } catch (e) {
      console.log('sleepInBed note:', e.message);
      await sleep(2000);
    }
  } else {
    console.log(`timeOfDay=${t.timeOfDay}, night in ${t.secondsUntilNight}s`);
    await sleep(4000);
  }
}

console.log('Morning status:', JSON.stringify(lib.status()));
bot.chat(`gamma awake at base at dawn! Food: ${bot.food}/20, HP: ${bot.health}/20`);
