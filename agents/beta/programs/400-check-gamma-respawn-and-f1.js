// programs/400-check-gamma-respawn-and-f1.js
console.log('=== Step: Check Gamma respawn, F1 remaining iron, and base status ===');

// 1. Check all players and locations
for (const [name, p] of Object.entries(bot.players)) {
  if (p.entity) {
    const pos = p.entity.position;
    const dist = bot.entity.position.distanceTo(pos).toFixed(1);
    console.log(`Player ${name}: pos=${lib.fmt(pos)}, dist=${dist}m`);
  } else {
    console.log(`Player ${name}: (no entity in range)`);
  }
}

// 2. Check F1 for the last 2 iron ingots
const fb1 = bot.blockAt(new Vec3(295, 72, -55));
if (fb1) {
  try {
    const f1 = await bot.openFurnace(fb1);
    const inItem = f1.inputItem();
    const fuelItem = f1.fuelItem();
    const outItem = f1.outputItem();
    console.log(`F1: in=${inItem?.name}x${inItem?.count}, fuel=${fuelItem?.name}x${fuelItem?.count}, out=${outItem?.name}x${outItem?.count}`);
    if (outItem && outItem.count > 0) {
      await f1.takeOutput();
      console.log(`Harvested ${outItem.count} ${outItem.name} from F1!`);
    }
    f1.close();
  } catch (e) {
    console.log('F1 error:', e.message);
  }
}

console.log('Beta iron_ingots now:', lib.count('iron_ingot'));
bot.chat(`beta: Wearing iron_helmet and shield! F1 checked. Gamma, are you safely back at base beds?`);
