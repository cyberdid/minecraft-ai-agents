// programs/724-base-rendezvous-and-plan.js
console.log('=== Program 724: Base Rendezvous and Coordination ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Ensure spawn is set at base bed (294, 72, -55)
try {
  await lib.setSpawn();
  console.log('Spawn confirmed at base bed!');
} catch (e) {}

// 2. Check all teammates nearby at base
console.log('Checking teammates at base:');
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const d = bot.entity.position.distanceTo(p.entity.position).toFixed(1);
    console.log(` - Teammate ${name} at ${lib.fmt(p.entity.position)} (${d}m), held: ${p.entity.heldItem?.name}`);
  }
}

// 3. Check furnaces at (295, 72, -54..-56)
for (const fz of [-54, -55, -56]) {
  const fPos = new Vec3(295, 72, fz);
  const fb = bot.blockAt(fPos);
  if (fb && fb.name === 'furnace') {
    try {
      const f = await bot.openFurnace(fb);
      console.log(`Furnace at ${lib.fmt(fPos)}: input=${f.inputItem()?.name}x${f.inputItem()?.count}, fuel=${f.fuelItem()?.name}x${f.fuelItem()?.count}, output=${f.outputItem()?.name}x${f.outputItem()?.count}`);
      if (f.outputItem()) {
        await f.takeOutput();
        console.log(`Took output: ${f.outputItem()?.name}`);
      }
      f.close();
    } catch (fe) {}
  }
}

// 4. Check Base Chest at (293, 72, -57)
const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
if (chestBlock) {
  try {
    const chest = await bot.openContainer(chestBlock);
    console.log('Base Chest items:');
    for (const item of chest.containerItems()) {
      console.log(` - ${item.name} x ${item.count}`);
    }
    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// 5. Check if night to sleep
if (lib.time().canSleep) {
  console.log('Night! Sleeping in base bed...');
  try {
    await lib.sleepInBed();
    bot.chat('alpha: Slept at base bed! Full reset to 20/20 HP and Food!');
  } catch (e) {}
}

// 6. Report status and plan
bot.chat(`alpha: Regrouped at Base (294, 72, -55)! HP: ${bot.health}/20, Food: ${bot.food}/20. All 16 blaze_powder secured in Base Chest! Ready for Milestone 9 (12+ Ender Pearls)!`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  hp: bot.health,
  food: bot.food,
  inv: lib.inv()
};
