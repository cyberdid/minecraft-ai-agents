// programs/731-verify-eyes-and-gear-up.js
bot.pathfinder.stop();
bot.pathfinder.setGoal(null);
bot.clearControlStates();

console.log('=== PROGRAM 731: VERIFY EYES OF ENDER & GEAR UP ===');
console.log('Delta Pos:', lib.fmt(bot.entity.position), 'HP:', bot.health, 'Food:', bot.food, 'Time:', bot.time.timeOfDay);

// Vacuum drops in room
try { await lib.pickup(6.0); } catch (e) {}

// Check players
console.log('--- Players in Render ---');
for (const p of Object.values(bot.entities).filter(e => e.type === 'player')) {
  console.log(`- ${p.username}: pos=${lib.fmt(p.position)}, held=${p.heldItem?.name}`);
}

// Check Base Chest
const cb = bot.blockAt(new Vec3(293, 72, -57));
if (cb) {
  try {
    const chest = await bot.openChest(cb);
    const items = chest.containerItems();
    console.log('--- Base Chest Items ---');
    for (const it of items) {
      if (['blaze_powder', 'blaze_rod', 'ender_pearl', 'ender_eye', 'cooked_beef', 'cooked_porkchop', 'bread', 'iron_ingot'].includes(it.name)) {
        console.log(`  * ${it.name} x${it.count}`);
      }
    }

    // If food in chest, eat
    const food = items.find(i => ['cooked_beef', 'cooked_porkchop', 'bread'].includes(i.name));
    if (food && bot.food < 18) {
      await chest.withdraw(food.type, null, Math.min(food.count, 6));
    }

    // If eyes in chest, withdraw up to 6
    const eyes = items.find(i => i.name === 'ender_eye');
    if (eyes && lib.count('ender_eye') < 6) {
      const take = Math.min(eyes.count, 6 - lib.count('ender_eye'));
      await chest.withdraw(eyes.type, null, take);
      console.log(`Withdrew ${take} ender_eye from chest!`);
    }

    chest.close();
  } catch (e) {
    console.log('Chest error:', e.message);
  }
}

// Eat if food
for (const f of ['cooked_beef', 'cooked_porkchop', 'bread']) {
  if (lib.count(f) > 0 && bot.food < 18) {
    try { await lib.eat(); } catch (e) {}
  }
}

try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

console.log('Delta Inventory:', JSON.stringify(lib.inv()));
return {
  eyes: lib.count('ender_eye'),
  pos: bot.entity.position,
  hp: bot.health,
  food: bot.food
};
