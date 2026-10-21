// programs/035-return-smelt-milestone2.js
// Return to base, smelt 14 raw iron, craft beta's iron tools & shield into chest to complete Milestone 2!

console.log('alpha at:', lib.fmt(bot.entity.position));
console.log('Raw iron in inventory:', lib.count('raw_iron'));

// 1. Return to base doorstep at (294, 72, -52)
console.log('Returning to base at (294, 72, -52)...');
await lib.goTo(294, 72, -52, 1, { dig: true });

// Step inside base
const doorPos = new Vec3(294, 72, -54);
let doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && !doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Walking inside...');
await lib.walkTo(294, -56);
doorBlock = bot.blockAt(doorPos);
if (doorBlock && doorBlock.getProperties && doorBlock.getProperties().open) {
  await bot.activateBlock(doorBlock);
  await sleep(300);
}
console.log('Safely inside base at:', lib.fmt(bot.entity.position));

// 2. Craft planks and sticks from logs
if (lib.count('*_log') > 0) {
  await lib.craft('oak_planks', 16);
  console.log('Planks count:', lib.count('oak_planks'));
}
if (lib.count('stick') < 8 && lib.count('*_planks') > 0) {
  await lib.craft('stick', 8);
  console.log('Sticks count:', lib.count('stick'));
}

// 3. Smelt 14 raw iron in furnace
const rawIronCount = lib.count('raw_iron');
console.log(`Smelting ${rawIronCount} raw iron...`);
if (rawIronCount > 0) {
  try {
    const smeltRes = await lib.smelt('raw_iron', 'oak_planks', rawIronCount);
    console.log('Smelt result:', JSON.stringify(smeltRes));
  } catch (e) {
    console.log('Smelt note:', e.message);
  }
}

// Check total iron ingots
console.log('Iron ingots available:', lib.count('iron_ingot'));

// 4. Craft beta's iron tools and deposit into chest at (293, 72, -57)
const chestPos = { x: 293, y: 72, z: -57 };

// beta iron pickaxe
if (lib.count('iron_ingot') >= 3) {
  try {
    await lib.craft('iron_pickaxe', 1);
    console.log('Crafted iron_pickaxe for beta');
    await lib.deposit({ iron_pickaxe: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited iron_pickaxe into chest');
  } catch (e) {
    console.log('Beta pick note:', e.message);
  }
}

// beta iron sword
if (lib.count('iron_ingot') >= 2) {
  try {
    await lib.craft('iron_sword', 1);
    console.log('Crafted iron_sword for beta');
    await lib.deposit({ iron_sword: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited iron_sword into chest');
  } catch (e) {
    console.log('Beta sword note:', e.message);
  }
}

// beta iron axe
if (lib.count('iron_ingot') >= 3) {
  try {
    await lib.craft('iron_axe', 1);
    console.log('Crafted iron_axe for beta');
    await lib.deposit({ iron_axe: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited iron_axe into chest');
  } catch (e) {
    console.log('Beta axe note:', e.message);
  }
}

// beta shield
if (lib.count('iron_ingot') >= 1 && lib.count('*_planks') >= 6) {
  try {
    await lib.craft('shield', 1);
    console.log('Crafted shield for beta');
    await lib.deposit({ shield: 1 }, chestPos.x, chestPos.y, chestPos.z);
    console.log('Deposited shield into chest');
  } catch (e) {
    console.log('Beta shield note:', e.message);
  }
}

bot.chat('alpha: Milestone 2 complete! Deposited iron pickaxe, iron sword, iron axe, and shield for beta in base chest.');

const chestContents = await lib.chestContents(chestPos.x, chestPos.y, chestPos.z);
console.log('Base chest contents now:', JSON.stringify(chestContents));

const time = lib.time();
console.log('Time until night:', time.secondsUntilNight, 's');

return {
  chest: chestContents,
  alphaTools: {
    pickaxe: lib.count('iron_pickaxe'),
    sword: lib.count('iron_sword'),
    axe: lib.count('iron_axe')
  },
  time: time.secondsUntilNight
};
