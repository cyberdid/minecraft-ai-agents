// programs/401-check-gamma-drops-outside.js
console.log('=== Step: Check for dropped items near base river ===');

// Check entities within 20m of base door (294, 72, -54)
const drops = Object.values(bot.entities).filter(e => 
  e.name === 'item' && bot.entity.position.distanceTo(e.position) < 25
);

console.log(`Found ${drops.length} item drops near base:`);
for (const d of drops) {
  console.log(`  Drop at ${lib.fmt(d.position)}, dist=${bot.entity.position.distanceTo(d.position).toFixed(1)}m`);
}

// Check F1 for the last smelted ingot
const fb1 = bot.blockAt(new Vec3(295, 72, -55));
if (fb1) {
  try {
    const f1 = await bot.openFurnace(fb1);
    const out = f1.outputItem();
    if (out && out.count > 0) {
      await f1.takeOutput();
      console.log(`Took ${out.count} ${out.name} from F1!`);
    }
    f1.close();
  } catch (e) {}
}

console.log(`Beta iron_ingots in inventory: ${lib.count('iron_ingot')}`);
bot.chat(`beta: Team in base. Beta holding ${lib.count('iron_ingot')} ingots, wearing iron_helmet + shield.`);
