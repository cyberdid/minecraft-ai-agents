// programs/249-join-beta-and-mine-obsidian.js
console.log('=== Program 249: Join Beta at (327, 19, -33) & Mine Obsidian ===');
console.log('Alpha pos:', lib.fmt(bot.entity.position), 'Health:', bot.health, 'Food:', bot.food);

bot.chat('beta: Meeting you at (327, 19, -33)! You hold diamond pickaxe & bucket: lead to (286, 18, 8) to quench 10 obsidian!');

// 1. Walk towards Beta at (327, 19, -33)
const target = new Vec3(327, 19, -33);
console.log('Moving towards Beta at (327, 19, -33)...');
try {
  await lib.goTo(target.x, target.y, target.z, 2, { dig: true, timeoutMs: 25000 });
  console.log('Arrived near Beta! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Move to Beta note:', e.message);
}

// 2. Pickup any drops around
await lib.pickup(8);

// Eat any food
for (const f of ['cooked_porkchop', 'cooked_beef', 'cooked_mutton', 'bread', 'apple', 'porkchop', 'beef']) {
  if (lib.count(f) > 0) {
    console.log(`Eating ${f}...`);
    try {
      const item = bot.inventory.items().find(it => it.name === f);
      if (item) {
        await bot.equip(item, 'hand');
        bot.activateItem();
        await sleep(2000);
        bot.deactivateItem();
      }
    } catch (e) {}
  }
}

// 3. Check Beta's position
if (bot.players.beta?.entity) {
  const b = bot.players.beta.entity;
  console.log('Beta pos:', lib.fmt(b.position), 'held:', b.heldItem?.name);
}

// 4. Move together to (286, 18, 8) lava lake
console.log('Heading towards lava lake at (286, 18, 8)...');
const lakeLedge = new Vec3(288, 19, 8);
try {
  await lib.goTo(lakeLedge.x, lakeLedge.y, lakeLedge.z, 2, { dig: true, timeoutMs: 25000 });
  console.log('At lava lake ledge! Pos:', lib.fmt(bot.entity.position));
} catch (e) {
  console.log('Move to lake note:', e.message);
}

// Scan for obsidian and lava
const lavas = bot.findBlocks({ matching: b => b.name === 'lava', maxDistance: 20, count: 50 });
const obs = bot.findBlocks({ matching: b => b.name === 'obsidian', maxDistance: 20, count: 20 });
console.log(`At lake ledge: ${lavas.length} lava blocks, ${obs.length} obsidian blocks!`);

// Pickup drops
await lib.pickup(6);

bot.chat(`beta: At lava lake ledge! Obsidian in view: ${obs.length}, in inv: ${lib.count('obsidian')}. Quench and mine 10 obsidian!`);
console.log('Alpha inventory:', JSON.stringify(lib.inv()));
