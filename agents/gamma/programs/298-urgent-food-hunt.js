// programs/298-urgent-food-hunt.js
console.log('=== URGENT FOOD SEARCH ===');
console.log('Pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);

// 1. Check players nearby
for (const [name, p] of Object.entries(bot.players)) {
  if (p && p.entity && name !== 'gamma') {
    const held = p.entity.heldItem?.name || 'none';
    console.log(`Player ${name} at ${lib.fmt(p.entity.position)} holding: ${held}`);
  }
}

// 2. Scan for any food crop or berry bush within 48 blocks
const crops = bot.findBlocks({
  matching: b => b && ['wheat', 'carrots', 'potatoes', 'sweet_berry_bush', 'beetroots'].includes(b.name),
  maxDistance: 48,
  count: 10
});
console.log(`Crops found (${crops.length}):`, crops.map(p => `${bot.blockAt(p).name} at ${lib.fmt(p)}`));

// 3. Scan for any animal within 96 blocks
const animals = Object.values(bot.entities).filter(e => {
  if (!e || !e.name) return false;
  return ['cow', 'pig', 'sheep', 'chicken'].includes(e.name);
});
console.log(`Animals within 96 blocks (${animals.length}):`);
for (const a of animals) {
  console.log(`  ${a.name} at ${lib.fmt(a.position)} (dist: ${bot.entity.position.distanceTo(a.position).toFixed(1)}m)`);
}

// 4. If an animal is found, go hunt it!
if (animals.length > 0) {
  animals.sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));
  const target = animals[0];
  console.log(`Moving to hunt nearest animal: ${target.name} at ${lib.fmt(target.position)}...`);
  try {
    await lib.equipWeapon();
    await lib.goTo(target.position.x, target.position.y, target.position.z, 2, { timeoutMs: 12000 });
    while (target.isValid && bot.entity.position.distanceTo(target.position) <= 4.5) {
      await bot.lookAt(target.position.offset(0, target.height * 0.5, 0));
      bot.attack(target);
      await sleep(600);
    }
    await sleep(400);
    await lib.pickup(6);
    console.log('Food in inventory after hunt:', JSON.stringify(lib.inv()));
  } catch (e) {
    console.log('Hunt error:', e.message);
  }
} else {
  // If no animal nearby, search for oak leaves to break for apples, or explore plains
  console.log('No animals nearby. Searching for oak leaves within 16 blocks to find apples...');
  const leaves = bot.findBlocks({
    matching: b => b && b.name === 'oak_leaves',
    maxDistance: 24,
    count: 20
  });
  console.log(`Found ${leaves.length} oak leaf blocks.`);
  let broken = 0;
  for (const lp of leaves) {
    if (broken >= 15 || isCancelled() || lib.count('apple') > 0) break;
    const b = bot.blockAt(lp);
    if (b) {
      try {
        await bot.lookAt(lp.offset(0.5, 0.5, 0.5));
        await bot.dig(b);
        broken++;
      } catch (e) {}
    }
  }
  await sleep(300);
  await lib.pickup(6);
  console.log(`Broke ${broken} leaves. Apples: ${lib.count('apple')}`);
  if (lib.count('apple') > 0) {
    await lib.eat();
  }
}

// 5. If we got raw meat, cook it in base furnace
for (const raw of ['beef', 'mutton', 'porkchop', 'chicken']) {
  if (lib.count(raw) > 0) {
    console.log(`Cooking ${lib.count(raw)} ${raw}...`);
    try {
      await lib.goTo(295, 72, -55, 2, { timeoutMs: 10000 });
      await lib.smelt(raw, 'oak_planks', lib.count(raw));
      await lib.eat();
    } catch (e) {
      console.log('Cooking note:', e.message);
    }
  }
}

console.log('End pos:', lib.fmt(bot.entity.position), 'Food:', bot.food, 'HP:', bot.health);
console.log('Inv:', JSON.stringify(lib.inv()));
