const beds = bot.findBlocks({
  matching: b => b && bot.isABed(b),
  maxDistance: 16,
  count: 10
})
console.log('All beds in base:', beds.map(p => `${lib.fmt(p)} (${bot.blockAt(p)?.name})`))
