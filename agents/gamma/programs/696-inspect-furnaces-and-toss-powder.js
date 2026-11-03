// programs/696-inspect-furnaces-and-toss-powder.js
globalThis.isProgramCancelled = isCancelled;

console.log('=== PROGRAM 696: INSPECT FURNACES & TOSS POWDER TO BETA ===');
console.log('Gamma Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// Step 1: Check furnaces for food
const furnaceCoords = [
  new Vec3(295, 72, -55),
  new Vec3(295, 72, -54),
  new Vec3(295, 72, -56)
];

for (const fc of furnaceCoords) {
  const fb = bot.blockAt(fc);
  if (fb && (fb.name === 'furnace' || fb.name === 'lit_furnace')) {
    try {
      console.log(`Checking furnace at ${lib.fmt(fc)}...`);
      const fn = await bot.openFurnace(fb);
      const out = fn.outputItem();
      const input = fn.inputItem();
      const fuel = fn.fuelItem();
      console.log(`Furnace at ${lib.fmt(fc)}: input=${input?.name}x${input?.count}, fuel=${fuel?.name}x${fuel?.count}, output=${out?.name}x${out?.count}`);
      if (out && ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton', 'cooked_chicken'].includes(out.name)) {
        console.log(`Taking ${out.name} x${out.count} from furnace...`);
        await fn.takeOutput();
      }
      fn.close();
    } catch (e) {
      console.log('Furnace error:', e.message);
    }
  }
}

// Eat if we got food
for (const f of ['cooked_beef', 'cooked_porkchop', 'bread', 'baked_potato', 'cooked_mutton', 'cooked_chicken']) {
  if (lib.count(f) > 0 && bot.food < 18) {
    console.log(`Eating ${f}...`);
    try { await lib.eat(); } catch (e) {}
  }
}

// Step 2: Toss 17 blaze_powder to Beta at (295, 72, -54)
const beta = bot.players.beta?.entity;
if (beta) {
  console.log(`Beta found at ${lib.fmt(beta.position)}!`);
  await bot.lookAt(beta.position.offset(0, 1.2, 0), true);
  const bp = bot.inventory.items().find(i => i.name === 'blaze_powder');
  if (bp) {
    const tossCount = Math.min(17, bp.count);
    console.log(`Tossing ${tossCount} blaze_powder to Beta...`);
    await bot.toss(bp.type, null, tossCount);
    bot.chat(`beta: Tossed ${tossCount} Blaze Powder to you! Combine with your 17 Ender Pearls to craft Eyes of Ender!`);
  }
} else {
  console.log('Beta not found in range.');
}

console.log('Remaining Blaze Powder in Gamma inventory:', lib.count('blaze_powder'));
console.log('Gamma food:', bot.food, 'HP:', bot.health);

return {
  food: bot.food,
  hp: bot.health,
  blaze_powder: lib.count('blaze_powder'),
  inv: lib.inv()
};
