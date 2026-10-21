// Pick up the crafting table in front of us
lib.protect(366, -37, -30, false)
await lib.dig(366, -37, -30)
await lib.pickup(4)
console.log('Crafting tables in inventory:', lib.count('crafting_table'))
