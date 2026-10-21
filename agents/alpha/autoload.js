// alpha/autoload.js
// Custom reliable door helper for base door at (294, 72, -54)

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
