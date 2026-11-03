// programs/757-fight-zombie-and-find-lava.js
console.log('=== Program 757: Slay Zombie & Uncover Lava Source ===');
console.log('Alpha at:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food);

// 1. Maintain offhand shield and equip iron sword to eliminate zombie
try {
  const shield = bot.inventory.items().find(i => i.name === 'shield');
  if (shield) await bot.equip(shield, 'off-hand');
} catch (e) {}

const sword = bot.inventory.items().find(i => i.name === 'iron_sword');
if (sword) await bot.equip(sword, 'hand');

// Check for hostiles
const hostiles = lib.hostiles(12);
console.log(`Hostiles nearby:`, hostiles);
for (const h of hostiles) {
  if (h.entity) {
    console.log(`Attacking ${h.name} at ${lib.fmt(h.entity.position)}...`);
    await bot.lookAt(h.entity.position.offset(0, 1.6, 0), true);
    bot.attack(h.entity);
    await sleep(650);
    bot.attack(h.entity);
    await sleep(650);
  }
}

// 2. Dig the granite block at (346, 40, -79)
const gb = bot.blockAt(new Vec3(346, 40, -79));
console.log(`Block at (346, 40, -79) is: ${gb?.name}`);
if (gb && (gb.name === 'granite' || gb.name === 'cobblestone' || gb.name === 'stone')) {
  console.log('Digging granite at (346, 40, -79)...');
  await lib.dig(346, 40, -79);
}

// 3. Scan all lava blocks within 16 blocks
const lavas = bot.findBlocks({
  matching: b => b && b.name.includes('lava'),
  maxDistance: 16,
  count: 20
});

console.log(`Found ${lavas.length} lava blocks:`);
for (const lp of lavas) {
  const blk = bot.blockAt(lp);
  const up = bot.blockAt(lp.offset(0, 1, 0));
  console.log(` - Pos: ${lib.fmt(lp)}, props: ${JSON.stringify(blk.getProperties())}, above: ${up?.name}`);
}

return {
  lavas: lavas.length,
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
