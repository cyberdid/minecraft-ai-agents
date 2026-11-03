// programs/675-slay-vacuum-and-retreat.js
console.log('=== Program 675: Slay Blazes, Vacuum Drops & Retreat ===');
console.log('Start pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

globalThis.isProgramCancelled = isCancelled;
const checkCancelled = () => (typeof globalThis.isProgramCancelled === 'function' ? globalThis.isProgramCancelled() : false);

// 1. Equip shield and sword
try { await lib.equipArmor(); } catch (e) {}
try { await lib.equipWeapon(); } catch (e) {}

// Raise shield immediately
bot.activateItem(true);
await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);

// 2. Short aggressive frontline combat round (30 seconds) to finish off damaged Blazes
console.log('Engaging weakened Blazes through firing slit...');
const start = Date.now();
let lastAttack = 0;
let hits = 0;
let kills = 0;

while (Date.now() - start < 35000 && !checkCancelled() && bot.game.dimension === 'the_nether') {
  const blazes = Object.values(bot.entities)
    .filter(e => e.name === 'blaze' && e.isValid && (e.health === undefined || e.health > 0))
    .sort((a, b) => bot.entity.position.distanceTo(a.position) - bot.entity.position.distanceTo(b.position));

  const target = blazes[0];
  if (target) {
    const dist = bot.entity.position.distanceTo(target.position);
    await bot.lookAt(target.position.offset(0, (target.height || 1.8) * 0.7, 0), true);

    if (dist <= 4.8 && Date.now() - lastAttack > 625) {
      bot.deactivateItem();
      try { await lib.equipWeapon(); } catch (e) {}
      bot.attack(target);
      lastAttack = Date.now();
      hits++;
      bot.activateItem(true);
      console.log(`Hit Blaze at ${dist.toFixed(1)}m (Hit #${hits})`);
      if (target.health !== undefined && target.health <= 0) {
        kills++;
        console.log(`Blaze eliminated! Kills: ${kills}`);
      }
    } else {
      bot.activateItem(true);
    }
  } else {
    await bot.lookAt(new Vec3(32.0, 68.0, -190.0), true);
    bot.activateItem(true);
  }

  // Vacuum drops
  if (Math.random() < 0.25) {
    try { await lib.pickup(3.0); } catch (e) {}
  }
  await sleep(100);
}

bot.deactivateItem();
try { await lib.pickup(3.5); } catch (e) {}

const myRods = lib.count('blaze_rod');
console.log(`Alpha holds ${myRods} Blaze Rods. Hits: ${hits}, Kills: ${kills}`);
bot.chat(`alpha: Finished frontline combat round. Alpha holds ${myRods} Blaze Rods. Beta holds 8 Blaze Rods!`);

// 3. Retreat to Overworld base to consolidate rods with Beta!
console.log('Retreating through covered route to Overworld base...');
bot.chat('alpha: Retreating to Overworld base to consolidate team Blaze Rods in base chest!');
await globalThis.retreatToOverworldBase();

console.log('Arrival pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension, 'HP:', bot.health);

if (bot.game.dimension === 'overworld') {
  // If holding rods, deposit in base chest
  if (lib.count('blaze_rod') > 0) {
    try {
      await lib.deposit({ blaze_rod: 'all' }, 293, 72, -57);
      console.log('Deposited Blaze Rods in chest (293, 72, -57)!');
    } catch (e) {
      console.log('Deposit error:', e.message);
    }
  }

  // Inspect base chest
  const chestBlock = bot.blockAt(new Vec3(293, 72, -57));
  if (chestBlock) {
    try {
      const chest = await bot.openChest(chestBlock);
      const items = chest.containerItems().map(i => `${i.name}x${i.count}`).join(', ');
      console.log('Base Chest contains:', items);
      await chest.close();
      bot.chat(`alpha: Base Chest contains: ${items}`);
    } catch (e) {
      console.log('Error opening chest:', e.message);
    }
  }
}

console.log('=== Program 675 Finished ===');
