// programs/127-break-leaves-for-apples.js
// Break oak leaves near base to get apples, eat, and step into base

console.log('alpha at:', lib.fmt(bot.entity.position), '| food:', bot.food);

const leaves = bot.findBlocks({
  matching: mcData.blocksByName.oak_leaves?.id,
  maxDistance: 8,
  count: 20
});

console.log(`Found ${leaves.length} oak leaves to break...`);

for (const p of leaves) {
  if (lib.count('apple') >= 2) break;
  try {
    await lib.dig(p.x, p.y, p.z);
    await sleep(150);
  } catch (e) {}
}

// Pickup drops
await lib.pickup(6);

// Eat any apples
if (lib.count('apple') > 0) {
  console.log(`Ate apple! Count was: ${lib.count('apple')}`);
  await lib.eat();
  if (lib.count('apple') > 0) await lib.eat();
}

// Step inside base
console.log('Stepping inside base...');
await passDoorIn();
console.log('Inside base! Pos:', lib.fmt(bot.entity.position));

console.log('Alpha food now:', bot.food, '| health:', bot.health, '| inv:', JSON.stringify(lib.inv()));
bot.chat(`alpha: Gathered from leaves. Food: ${bot.food}/20, Health: ${Math.round(bot.health)}/20.`);
