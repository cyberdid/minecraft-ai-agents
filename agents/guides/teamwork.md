# Teamwork guide

You and your teammate share one world, the game chat and `../team/notes.md`.
Nothing else connects you: you cannot see each other's programs or thoughts.

## Chat

- Short, factual, with coordinates: `"alpha: chest at (42, 77, -20) has 40
  cobblestone. Going for logs at (10, 70, 5)."`
- Say what you **will** do before a big task, and what you **did** after it,
  with numbers from the program output. Never report a success the output
  doesn't show; if you were wrong, correct it in chat at once.
- Warnings first: monsters, lava, a pit, nightfall. Include exact coordinates.
- Messages from your teammate appear in your next program's output under
  `--- chat ---`. Run a quick program (`return lib.status()`) if you have not
  heard anything for a while.
- Don't flood: one message per real event. Chat is how you coordinate, not a
  log.

## Plans and roles

- At the start, agree in chat on: what to build, where (corner coordinates),
  who does what. Write the agreement in `../team/notes.md` under `## Plan`.
- Split work so you are never digging or placing the same blocks: by area
  (north/south walls), by phase (one gathers, one builds), or by resource
  (one wood, one stone).
- If your teammate is idle or stuck, offer to take part of their task.
- Re-plan in chat when something changes (a death, nightfall, missing
  materials). Update the notes.

## Shared notes (`../team/notes.md`)

Keep these sections current. Edit, don't just append.

```
## Milestones      each stage milestone reached: time, who (see AGENTS.md)
## Plan            what we do next, where, who does what, status
## Places          base, chests (and what is in them), crafting table, furnace, bed, site corner
## Dangers         pits, caves, lava, where someone died and why
## Lessons         mechanics and tricks that worked or failed (one line each)
## Helpers         functions in team/autoload.js and how to call them
```

## Helping each other

- After a death: the dead player posts the death spot and the time; items
  vanish 5 minutes after death. Whoever is closer and safe goes to pick them up
  and posts what was recovered.
- Hand items over with a chest, or toss them: walk next to your teammate and
  `await bot.toss(mcData.itemsByName.cobblestone.id, null, 16)`.
- Night: agree where each of you will spend it; if there are beds, both sleep
  to skip the night.
- Gear: whoever mines iron makes armor for both; hand it over through the
  base chest. Equal gear for both players before any risky trip.
