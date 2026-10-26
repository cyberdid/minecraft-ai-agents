// programs/164-mine-iron-and-craft-pickaxes.js
console.log('--- Mining Iron for Iron Pickaxes ---');
console.log('Pos:', lib.fmt(bot.entity.position), 'Night in:', lib.time().secondsUntilNight);

bot.chat('alpha: Mining iron right now at hillside to craft iron pickaxes for both of us!');

// 1. Step outside base
const d = bot.blockAt(new Vec3(294, 72, -54));
if (d && !d.getProperties().open) await bot.activateBlock(d);
await lib.walkTo(294.5, -52.0, 3000);
if (d && d.getProperties().open) await bot.activateBlock(d);

// 2. Travel to iron hillside at (311, 65, -65)
console.log('Moving to iron hill at (311, 65, -65)...');
try {
  await lib.goToXZ(311, -65);
} catch (e) {
  console.log('goToXZ note:', e.message);
}

console.log('Scanning for iron ores near', lib.fmt(bot.entity.position));
// Filter to ores above y >= 45 to stay safe out of deep aquifers
const ores = bot.findBlocks({
  matching: b => b.name === 'iron_ore' || b.name === 'deepslate_iron_ore',
  maxDistance: 32,
  count: 30
}).map(p => bot.blockAt(p))
  .filter(b => b && b.position.y >= 50)
  .sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position));

console.log(`Found ${ores.length} safe iron ores at y >= 50.`);

let mined = 0;
for (const ore of ores) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  console.log(`Mining iron at ${lib.fmt(ore.position)}...`);
  try {
    await lib.goTo(ore.position.x, ore.position.y, ore.position.z, 2, { dig: true });
    await lib.dig(ore.position.x, ore.position.y, ore.position.z);
    await lib.pickup(4);
    mined++;
  } catch (e) {
    console.log(`Mine error at ${lib.fmt(ore.position)}:`, e.message);
  }
  if (lib.count('raw_iron') >= 8) {
    console.log(`Gathered ${lib.count('raw_iron')} raw iron! Returning to base.`);
    break;
  }
}

// 3. Return to base
console.log('Returning to base at (294, 72, -53)...');
try {
  await lib.goTo(294, 72, -53, 1);
  const d2 = bot.blockAt(new Vec3(294, 72, -54));
  if (d2 && !d2.getProperties().open) await bot.activateBlock(d2);
  await lib.walkTo(293.5, -56.0, 3000);
  if (d2 && d2.getProperties().open) await bot.activateBlock(d2);
  console.log('Safely inside base!');
} catch (e) {
  console.log('Return error:', e.message);
}

// 4. Smelt raw iron
const rawIronCount = lib.count('raw_iron');
console.log('Raw iron in inventory:', rawIronCount);
if (rawIronCount > 0) {
  console.log('Smelting iron in base furnace...');
  try {
    // Collect 2 logs or use planks/sticks
    let fuel = 'birch_planks';
    if (lib.count('*_planks') < 3) {
      fuel = 'stick';
    }
    await lib.smelt('raw_iron', fuel, rawIronCount);
    console.log('Smelted iron! Ingots:', lib.count('iron_ingot'));
  } catch (e) {
    console.log('Smelt error:', e.message);
  }
}

// 5. Craft iron pickaxes
const ingots = lib.count('iron_ingot');
console.log('Total iron ingots available:', ingots);

if (ingots >= 3) {
  try {
    if (lib.count('stick') < 4) {
      await lib.craft('stick', 4);
    }
    await lib.craft('iron_pickaxe', 1);
    console.log('Crafted first iron_pickaxe!');
    
    if (lib.count('iron_ingot') >= 3) {
      await lib.craft('iron_pickaxe', 1);
      console.log('Crafted second iron_pickaxe!');
      // Put one in chest for Beta
      await lib.deposit({ iron_pickaxe: 1 }, 293, 72, -57);
      bot.chat('beta: Placed iron_pickaxe in chest for you! Let us mine the diamonds!');
    } else {
      // Hand to Beta or keep
      await lib.deposit({ iron_pickaxe: 1 }, 293, 72, -57);
      bot.chat('beta: Placed iron_pickaxe in chest for you! Mine diamonds at (310, 2, -44)!');
    }
  } catch (e) {
    console.log('Craft pickaxe error:', e.message);
  }
}

console.log('Final inventory:', JSON.stringify(lib.inv()));
console.log('Night in:', lib.time().secondsUntilNight, 's');
