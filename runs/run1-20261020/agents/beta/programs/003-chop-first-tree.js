const Vec3 = require('vec3');

console.log('Starting to chop tree near (35, 84, -23)...');

const targetLogs = [
  new Vec3(35, 84, -23),
  new Vec3(35, 83, -23),
  new Vec3(35, 82, -23),
  new Vec3(35, 81, -23),
  new Vec3(35, 85, -23),
  new Vec3(36, 84, -17),
  new Vec3(36, 83, -17)
];

let chopped = 0;
for (const pos of targetLogs) {
  if (isCancelled()) break;
  const block = bot.blockAt(pos);
  if (!block || !block.name.endsWith('_log')) {
    console.log(`Block at ${pos} is not a log (${block?.name}), skipping.`);
    continue;
  }
  console.log(`Mining ${block.name} at ${pos}...`);
  try {
    if (bot.entity.position.distanceTo(pos) > 3.5) {
      await globalThis.goTo(pos, 2);
    }
    await bot.lookAt(pos.offset(0.5, 0.5, 0.5));
    await bot.dig(block);
    chopped++;
    console.log(`Successfully mined log at ${pos}`);
    await bot.waitForTicks(5);
    await globalThis.collectDrops(5);
  } catch (err) {
    console.log(`Error mining at ${pos}: ${err.message}`);
  }
}

await globalThis.collectDrops(8);

const items = bot.inventory.items().map(i => `${i.name}x${i.count}`).join(', ');
console.log(`Inventory now: ${items || 'empty'}`);

return { chopped, inventory: items };
