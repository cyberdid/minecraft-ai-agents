// programs/023-hunt-and-cook-food.js
console.log('Pos before:', lib.fmt(bot.entity.position));
console.log('Time:', JSON.stringify(lib.time()));

await lib.equipWeapon();

// Hunt 2-3 animals for meat
const mobs = ['cow', 'pig', 'sheep'];
let hunted = 0;
for (const mob of mobs) {
  if (isCancelled() || lib.time().secondsUntilNight < 180) break;
  try {
    console.log(`Hunting ${mob}...`);
    const r = await lib.hunt(mob, 2);
    console.log(`Hunt result for ${mob}:`, JSON.stringify(r));
    hunted += r.killed;
    if (hunted >= 2) break;
  } catch (e) {
    console.log(`Hunt ${mob} note:`, e.message);
  }
}

console.log('Inventory after hunting:', JSON.stringify(lib.inv()));

// Check for raw meat
const rawKeys = ['beef', 'raw_beef', 'porkchop', 'raw_porkchop', 'mutton', 'raw_mutton', 'chicken', 'raw_chicken'];
const rawInInv = Object.keys(lib.inv()).filter(k => rawKeys.includes(k) && lib.inv()[k] > 0);

if (rawInInv.length > 0) {
  console.log('Raw meat found:', rawInInv.map(k => `${k}: ${lib.inv()[k]}`).join(', '));
  
  // Craft furnace if needed
  if (!lib.count('furnace')) {
    console.log('Crafting furnace...');
    await lib.craft('furnace', 1);
  }
  
  // Smelt the meat
  for (const raw of rawInInv) {
    const count = lib.inv()[raw];
    console.log(`Smelting ${count} of ${raw}...`);
    try {
      const smeltRes = await lib.smelt(raw, 'oak_planks', count);
      console.log('Smelt result:', JSON.stringify(smeltRes));
    } catch (e) {
      console.log('Smelt error:', e.message);
    }
  }
} else {
  console.log('No raw meat gathered yet.');
}

console.log('Final inv:', JSON.stringify(lib.inv()));
const cooked = Object.keys(lib.inv()).filter(k => k.startsWith('cooked_'));
if (cooked.length > 0) {
  bot.chat(`delta: Cooked food secured: ${cooked.map(k => `${k}x${lib.inv()[k]}`).join(', ')}! Bringing to Beta!`);
} else {
  bot.chat('delta: Still searching for animals on surface for meat.');
}
