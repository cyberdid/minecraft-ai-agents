// Toss junk stones to make room, then pick up obsidian drops
const junk = ['andesite', 'granite', 'diorite', 'tuff']
for (const name of junk) {
  const item = mcData.itemsByName[name]
  if (item && lib.count(name) > 0) {
    console.log(`Tossing ${name}...`)
    await bot.toss(item.id, null, lib.count(name)).catch(e => console.log('Toss error:', e.message))
    await sleep(200)
  }
}

console.log('Tossed junk. Free slots now:', bot.inventory.emptySlotCount())

// Now pick up all obsidian items within 16 blocks!
console.log('Picking up obsidian...')
const gained = await lib.pickup(16)
console.log('Pickup gained:', JSON.stringify(gained))
console.log('Obsidian in inventory:', lib.count('obsidian'))
return { obsidian: lib.count('obsidian'), freeSlots: bot.inventory.emptySlotCount() }
