// programs/199-mine-netherrack.js
console.log('--- MINE NETHERRACK RESERVE FOR ASSAULT ---');
console.log('Start pos:', lib.fmt(bot.entity.position));

const pick = bot.inventory.items().find(i => i.name.includes('pickaxe'));
if (pick) await bot.equip(pick, 'hand');

// Find netherrack blocks with y >= 65
const blocks = bot.findBlocks({
  matching: b => b && b.name === 'netherrack' && b.position && b.position.y >= 65,
  maxDistance: 8,
  count: 48
});

console.log(`Found ${blocks.length} netherrack blocks nearby to mine:`);
for (const p of blocks) {
  if (lib.count('netherrack') >= 48 || isCancelled()) break;
  try {
    await lib.dig(p.x, p.y, p.z);
    await sleep(60);
    await lib.pickup(3);
  } catch (e) {
    console.log('Dig note:', e.message);
  }
}

console.log('Netherrack count now:', lib.count('netherrack'));
console.log('Tools:', JSON.stringify(lib.tools()));
console.log('Inv:', JSON.stringify(lib.inv()));
bot.chat(`gamma stocked ${lib.count('netherrack')} netherrack!`);
