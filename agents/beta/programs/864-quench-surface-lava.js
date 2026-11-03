// programs/864-quench-surface-lava.js
console.log('=== Program 864: Check & Quench Any Surface Lava Near Base ===');

const p = bot.entity.position;
console.log(`Beta pos: ${lib.fmt(p)}`);

const lavas = bot.findBlocks({
  matching: b => b && (b.name === 'lava' || b.name === 'flowing_lava'),
  maxDistance: 16,
  count: 20
});

console.log(`Found ${lavas.length} lava blocks near base:`);
for (const lp of lavas) {
  const b = bot.blockAt(lp);
  console.log(`  ${lib.fmt(lp)}: ${b.name} (meta:${b.metadata}) dist=${p.distanceTo(lp).toFixed(1)}m`);
}

// If there is lava on the ground outside, scoop or plug with cobblestone!
for (const lp of lavas) {
  // If it's a source block and we have empty bucket, scoop it!
  const b = bot.blockAt(lp);
  if (b && b.name === 'lava' && b.metadata === 0 && lib.count('lava_bucket') === 0 && lib.count('bucket') > 0) {
    console.log(`Scooping lava source block at ${lib.fmt(lp)}!`);
    const bkt = bot.inventory.items().find(i => i.name === 'bucket');
    if (bkt) {
      await bot.equip(bkt, 'hand');
      await bot.lookAt(lp.offset(0.5, 0.5, 0.5), true);
      bot.activateItem();
      await sleep(800);
      console.log(`Lava bucket in inventory now: ${lib.count('lava_bucket')}`);
    }
  } else if (b && (b.name === 'flowing_lava' || b.name === 'lava')) {
    // If we have water bucket, pour water near it to turn into obsidian/cobblestone!
    console.log(`Quenching lava at ${lib.fmt(lp)} with water_bucket...`);
    const wb = bot.inventory.items().find(i => i.name === 'water_bucket');
    if (wb) {
      await bot.equip(wb, 'hand');
      await bot.lookAt(lp.offset(0.5, 1.0, 0.5), true);
      bot.activateItem();
      await sleep(1000);
      // Scoop water back
      const eb = bot.inventory.items().find(i => i.name === 'bucket');
      if (eb) {
        await bot.equip(eb, 'hand');
        await bot.lookAt(lp.offset(0.5, 1.0, 0.5), true);
        bot.activateItem();
        await sleep(600);
      }
    }
  }
}

// Check obsidian formed
const obs = bot.findBlocks({ matching: b => b && b.name === 'obsidian', maxDistance: 16 });
console.log(`Obsidian blocks near base: ${obs.length}:`, obs.map(o => lib.fmt(o)));
