// programs/198-mine-netherrack-reserve.js
console.log('--- MINE 64 NETHERRACK FOR ENCLOSED BLAZE ASSAULT BRIDGE ---');
console.log('Start pos:', lib.fmt(bot.entity.position));
console.log('Pickaxe:', JSON.stringify(lib.tools()));

const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Mine netherrack nearby (above y=64 so we don't break our bridge floor)
const initial = lib.count('netherrack');
console.log('Netherrack before:', initial);

// Find netherrack blocks within 6 blocks with y >= 65
const blocks = bot.findBlocks({
  matching: b => b.name === 'netherrack' && b.position.y >= 65,
  maxDistance: 6,
  count: 64
});

console.log(`Found ${blocks.length} netherrack blocks nearby to mine:`);
for (const p of blocks) {
  if (lib.count('netherrack') >= 64 || isCancelled()) break;
  try {
    await lib.dig(p.x, p.y, p.z);
    await sleep(80);
    await lib.pickup(3);
  } catch (e) {
    console.log('Dig note:', e.message);
  }
}

console.log('Netherrack count now:', lib.count('netherrack'));
console.log('Final tools:', JSON.stringify(lib.tools()));
console.log('Final inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma mined ${lib.count('netherrack')} netherrack! Stocked to bridge safely to Blaze Spawner.`);
