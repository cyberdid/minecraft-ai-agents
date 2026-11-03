// programs/747-obtain-bucket-and-flint-and-steel.js
console.log('=== Program 747: Mine Iron, Dig Flint & Craft Repair Tools ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health, 'Food:', bot.food);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Maintain offhand shield and iron pickaxe
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield && bot.inventory.slots[45]?.name !== 'shield') {
    await bot.equip(shield, 'off-hand');
  }
} catch (e) {}

const pick = bot.inventory.items().find(i => i.name === 'iron_pickaxe');
if (pick) await bot.equip(pick, 'hand');

// 2. Dig gravel at (290, 66, -65) until we get 1 flint
console.log('Digging gravel for 1 flint at (290, 66, -65)...');
bot.chat('alpha: Sourcing flint from gravel at (290, 66, -65) and iron from mine shaft to repair portal!');

for (let attempt = 0; attempt < 8 && lib.count('flint') === 0 && !checkCancelled(); attempt++) {
  const gravel = bot.findBlock({ matching: b => b && b.name === 'gravel', maxDistance: 16 });
  if (gravel) {
    try {
      await bot.pathfinder.goto(new goals.GoalNear(gravel.position.x, gravel.position.y, gravel.position.z, 2.0));
      await bot.dig(gravel);
      await sleep(200);
      await lib.pickup(3.0);
    } catch (e) {}
  }
}

console.log(`Flint count: ${lib.count('flint')}`);

// 3. Staged descent down safe mine shaft to y=48
console.log('Descending mine shaft at (302, 71, -44)...');
const descent = [
  new Vec3(302, 71, -44),
  new Vec3(302, 66, -46),
  new Vec3(302, 60, -50),
  new Vec3(299, 53, -58),
  new Vec3(304, 48, -65)
];

for (let i = 0; i < descent.length && !checkCancelled(); i++) {
  const p = descent[i];
  console.log(`Descent step ${i + 1}/${descent.length}: heading to ${lib.fmt(p)}...`);
  try {
    await lib.goTo(p.x, p.y, p.z, 1.5, { timeoutMs: 7000 });
  } catch (e) {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y, p.z + 0.5), true);
    bot.setControlState('forward', true);
    await sleep(600);
    bot.setControlState('forward', false);
  }
}

console.log('At mine depth y=48:', lib.fmt(bot.entity.position));

// 4. Find and mine iron ores at depth
const ironOres = bot.findBlocks({
  matching: b => b && (b.name === 'iron_ore' || b.name === 'deepslate_iron_ore'),
  maxDistance: 12,
  count: 6
});

console.log(`Found ${ironOres.length} iron ores at depth:`);
for (const p of ironOres) {
  if (checkCancelled()) break;
  console.log(`Mining iron ore at ${lib.fmt(p)}...`);
  try {
    const b = bot.blockAt(p);
    if (b) {
      if (pick) await bot.equip(pick, 'hand');
      await bot.dig(b);
      await sleep(200);
      await lib.pickup(3.5);
    }
  } catch (e) {}
}

await lib.pickup(4.0);
console.log(`Raw iron count: ${lib.count('raw_iron')}`);

// 5. Staged ascent back to surface Base (295, 72, -54)
console.log('Ascending mine shaft back to surface...');
const ascent = [
  new Vec3(299, 53, -58),
  new Vec3(302, 60, -50),
  new Vec3(302, 66, -46),
  new Vec3(302, 71, -44),
  new Vec3(295, 72, -54)
];

for (let i = 0; i < ascent.length && !checkCancelled(); i++) {
  const p = ascent[i];
  try {
    await lib.goTo(p.x, p.y, p.z, 1.5, { timeoutMs: 7000 });
  } catch (e) {
    await bot.lookAt(new Vec3(p.x + 0.5, p.y, p.z + 0.5), true);
    bot.setControlState('forward', true);
    bot.setControlState('jump', true);
    await sleep(800);
    bot.setControlState('forward', false);
    bot.setControlState('jump', false);
  }
}

console.log('Back at base:', lib.fmt(bot.entity.position));

// 6. Smelt raw iron in Base Furnace (295, 72, -54)
const rawIron = lib.count('raw_iron');
if (rawIron > 0) {
  console.log(`Smelting ${rawIron} raw iron in furnace (295, 72, -54)...`);
  const fb = bot.blockAt(new Vec3(295, 72, -54));
  if (fb) {
    try {
      const furnace = await bot.openFurnace(fb);
      const fuel = bot.inventory.items().find(i => i.name.includes('_planks') || i.name === 'coal');
      const raw = bot.inventory.items().find(i => i.name === 'raw_iron');
      if (fuel && !furnace.fuelItem()) {
        await furnace.putFuel(fuel.type, null, Math.min(fuel.count, 4));
      }
      if (raw) {
        await furnace.putInput(raw.type, null, raw.count);
      }
      console.log('Smelting started! Waiting for output...');
      
      const smeltStart = Date.now();
      while (Date.now() - smeltStart < 30000 && !checkCancelled()) {
        if (furnace.outputItem() && furnace.outputItem().count >= Math.min(rawIron, 4)) {
          break;
        }
        await sleep(1000);
      }
      if (furnace.outputItem()) {
        console.log(`Taking ${furnace.outputItem().count} iron ingots!`);
        await furnace.takeOutput();
      }
      furnace.close();
    } catch (e) {
      console.log('Furnace error:', e.message);
    }
  }
}

console.log(`Total iron ingots: ${lib.count('iron_ingot')}`);

// 7. Craft bucket and flint_and_steel
if (lib.count('iron_ingot') >= 3 && lib.count('bucket') === 0) {
  try {
    console.log('Crafting bucket...');
    await lib.craft('bucket', 1);
    console.log('Bucket crafted!');
    bot.chat('alpha: Crafted bucket for casting obsidian!');
  } catch (e) {
    console.log('Craft bucket error:', e.message);
  }
}

if (lib.count('iron_ingot') >= 1 && lib.count('flint') >= 1 && lib.count('flint_and_steel') === 0) {
  try {
    console.log('Crafting flint_and_steel...');
    await lib.craft('flint_and_steel', 1);
    console.log('Flint and steel crafted!');
    bot.chat('alpha: Crafted flint_and_steel for reigniting Nether portal!');
  } catch (e) {
    console.log('Craft flint_and_steel error:', e.message);
  }
}

bot.chat(`alpha: Repair tools status — Bucket: ${lib.count('bucket')}, Flint&Steel: ${lib.count('flint_and_steel')}, Iron: ${lib.count('iron_ingot')}, Flint: ${lib.count('flint')}`);

return {
  pos: bot.entity.position,
  dim: bot.game.dimension,
  bucket: lib.count('bucket'),
  flintAndSteel: lib.count('flint_and_steel'),
  iron: lib.count('iron_ingot'),
  flint: lib.count('flint'),
  inv: lib.inv()
};
