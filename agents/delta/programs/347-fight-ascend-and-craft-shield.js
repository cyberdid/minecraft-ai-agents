// programs/347-fight-ascend-and-craft-shield.js
console.log('Delta pos:', lib.fmt(bot.entity.position), 'dim:', bot.game.dimension);

// 1. Defend against nearby skeleton if aggressive
const hostiles = lib.hostiles(10);
console.log(`Hostiles within 10m: ${hostiles.length}`);
if (hostiles.length > 0) {
  const skel = hostiles[0];
  console.log(`Defending against ${skel.name} at ${lib.fmt(skel.pos)} (dist: ${skel.dist.toFixed(1)}m)...`);
  const sword = bot.inventory.items().find(i => i.name.includes('sword'));
  if (sword) await bot.equip(sword, 'hand');
  try {
    const e = bot.entities[skel.id] || Object.values(bot.entities).find(ent => ent && ent.name === skel.name && bot.entity.position.distanceTo(ent.position) < 12);
    if (e) {
      await bot.lookAt(e.position.offset(0, 1.5, 0), true);
      await bot.attack(e);
      await sleep(600);
      await bot.attack(e);
      await sleep(600);
      await bot.attack(e);
    }
  } catch (err) {
    console.log('Combat note:', err.message);
  }
}

// 2. Ascend to surface base entrance (302, 71, -44)
console.log('Ascending mine stairs to surface (302, 71, -44)...');
try {
  await lib.goTo(302, 71, -44, 2, { timeoutMs: 25000 });
} catch (e) {
  console.log('Ascend note:', e.message);
  await bot.lookAt(new Vec3(302, 71, -44), true);
  bot.setControlState('forward', true);
  bot.setControlState('jump', true);
  await sleep(4000);
  bot.clearControlStates();
}

console.log('At surface pos:', lib.fmt(bot.entity.position));

// 3. Collect 2 logs for planks (fuel + shield crafting)
if (lib.count('*_log') < 2 && lib.count('*_planks') < 7) {
  console.log('Collecting 2 logs...');
  try {
    await lib.collect('*_log', 2);
    console.log('Collected logs! Log count:', lib.count('*_log'));
  } catch (e) {
    console.log('Collect log note:', e.message);
  }
}

// Craft planks from logs
const logs = bot.inventory.items().filter(i => i.name.endsWith('_log'));
for (const l of logs) {
  const plankName = l.name.replace('_log', '_planks');
  try {
    await lib.craft(plankName, l.count * 4);
  } catch (e) {}
}
console.log('Planks count now:', lib.count('*_planks'));

// 4. Smelt 1 raw iron in furnace
console.log('Smelting 1 raw_iron...');
try {
  const fuelName = bot.inventory.items().find(i => i.name.endsWith('_planks'))?.name || 'oak_planks';
  await lib.smelt('raw_iron', fuelName, 1);
  console.log('Smelted iron ingot! Count:', lib.count('iron_ingot'));
} catch (e) {
  console.log('Smelt note:', e.message);
}

// 5. Craft Shield
console.log('Crafting shield...');
try {
  await lib.craft('shield', 1);
  console.log('Shield crafted! Count:', lib.count('shield'));
} catch (e) {
  console.log('Craft shield note:', e.message);
}

// 6. Equip armor, shield in off-hand, sword in main hand
try {
  await lib.equipArmor();
} catch (e) {}

const shield = bot.inventory.items().find(i => i.name === 'shield');
if (shield) {
  try {
    await bot.equip(shield, 'off-hand');
    console.log('Shield locked into OFF-HAND!');
    bot.chat('delta: Equipped SHIELD in off-hand! Ready to block fireballs!');
  } catch (e) {
    console.log('Equip shield note:', e.message);
  }
}

const sword = bot.inventory.items().find(i => i.name.includes('sword'));
if (sword) await bot.equip(sword, 'hand');

console.log('Final inventory before Nether breach:');
for (const item of bot.inventory.items()) {
  console.log(`  ${item.name} x${item.count}`);
}
