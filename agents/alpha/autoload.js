// alpha/autoload.js
// Custom reliable door helper for base door at (294, 72, -54)

globalThis.safeEat = async function(foodName) {
  const item = bot.inventory.items().find(i => i.name === foodName);
  if (!item) return false;
  await bot.equip(item, 'hand');
  bot.deactivateItem();
  bot.activateItem();
  const startFood = bot.food;
  const startCount = bot.inventory.count(item.type);
  for (let i = 0; i < 40; i++) {
    await sleep(100);
    if (bot.food > startFood || bot.inventory.count(item.type) < startCount) {
      bot.deactivateItem();
      return true;
    }
  }
  bot.deactivateItem();
  return false;
};

globalThis.passDoorOut = async function() {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(294.5, -52);
  await lib.door(294, 72, -54, false);
};

globalThis.passDoorIn = async function() {
  await lib.door(294, 72, -54, true);
  await sleep(200);
  await lib.walkTo(294.5, -56);
  await lib.door(294, 72, -54, false);
};
