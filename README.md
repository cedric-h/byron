# premise
_Byron_ is a sandbox survival game set in a post-apocalyptic desert.  
It is played through a first-person perspective on small servers of 10-15 players.  
All players are confined to a mile-wide desert canyon (walkable in perhaps 15 minutes, drivable in much less).  

Inside of this canyon are ruined buildings and other structures.  

Players may build voxel-based structures in static parts of the canyon,
or explore and scavenge in periodically regenerated portions.[1]

Alongside structures, they may also create voxel-based vehicles and
engage in skirmishes with travelling NPC groups or other players.

[1] Building is still possible in the dynamic portion of the canyon, and
lootable structures may still appear in the static portions, but it is assumed
that in the general case, people want things that they build to stick around,
and ruins that they've already looted to be replaced.

## Broad Overview

### the substrate
Each structure occupies one or more oriented, destructible voxel grids.
Consider the case of a door that can be rotated and destroyed independently of its frame.
Consider that the house the door is attached to may not be aligned to the same axes of another building nearby.
The voxels that make up this building may even be smaller than that of another.

The player may choose to build off of existing voxel grids or orient new grids _de novo_.

The voxels in these grids, while still quite large, perhaps half the size
of the grid in _Minecraft_, are rarely placed on a single-voxel basis. Rather,
the player places salvaged pieces which occupy several voxels, often in panes.
The voxel grid becomes more readily apparent when buildings are damaged by arms
fire, explosives, or melee attacks, which may cause entire voxels to be removed.

Vehicles may be constructed from voxels in a similar fashion.
The player may place, for example, wheel and engine pieces.
Rather than being expected to adhere directly to the laws of physics,
rough heuristics are used to establish the handling
and power of the vehicle as a function of its construction.

Vehicles with more wheels may be slower but more durable
(simply because the vehicle becomes inoperable when all wheels are destroyed),
while more engines may simply increase the acceleration and maximum
speed regardless of where on the vehicle they occur.

### the atmosphere
The world is occupied by empty desert, dusty roads, and the remnants of civilization.
Call to mind broken open warehouses, abandoned gas stations, fallen and faded billboards.
See Mad Max with more ruins, Fallout 4 but flatter and with less trees.
Perhaps sand-covered necromonger desert-cultist temples?

Most of the canyon is "quicksand," completely deleted and regenerated during sandstorms
which occur periodically. In the wake of these storms, ruined and looted buildings may be
replaced by open desert, and new structures may appear in what had been open desert nearby.
One might imagine they are simply unburied by the sandstorm, or whisked in from far away.

Contrasted against the "quicksand," there are also small "oases," remarkable for their immutability.
These are never wiped clean and regenerated by the sandstorms.
Players may find it preferable to build in these areas.

### mechanically
The player may use irrigation techniques -- namely, placing pipe voxels -- to extend oases,
allowing themselves to build in a larger area without having their structures whisked away.

The player can be damaged by environmental hazards such as cacti or falling from high places,
as well as travelling bandit groups or automatic turrets in abandoned buildings.

If the player sustains damage in excess, they are teleported back to the nearest oasis.
There are perhaps three oases in the entire canyon.

Visualized by a bar, health points are tracked to make it easy to adjust the difficulty of the game.
To encourage scavenging, the player also has a food bar which prevents the regeneration of health when empty.
Similarly, the player may press shift to run faster; however, this is made impossible if their food bar is empty.

Without any items, the player may launch a melee attack capable of destroying select voxels or damaging enemy entities.
The player has a hotbar of 9 items they may switch between easily via the number keys,
and are capable of storing more items in a larger inventory.

There is a chat for communicating with other players on the same server.

## Details

# wasteland voxel structures
## cactus
destructible voxels, sometimes yields cactus meat, cactus seeds
found often in oases
## barrel
destructible voxels surrounding canned "meat," metal sheet or shells
## road sign
destructible sign
## crate
destructible voxels surrounding canned "meat," metal sheet, screws, shells
## rock shelf
just a sheet of destructible terrain voxels
## geyser
just a mound of destructible terrain voxels, particle effect
## mailbox
open and closed state, interact to toggle
sometimes contains canned "meat," shells
## workbench
can have hammer, crowbar on surface
drawers with screws, pipes, shells
## dresser/cabinets
an array of "mailboxes"
sometimes contains canned "meat," shells, bandages and gauze
## portajohn
crowbar jammed in the door, skull in the pot?
## half-buried billboard
crowbar/shotgun hidden behind it
## busted van
canned "meat" or shells in dash or in back, strip metal sheet from wall?
possible source of engine and wheel voxels?
## shipping container
can contain metal sheets
surrounded/filled by crates, barrels
may be crowbar outside
## trailer
door requires crowbar to break open
may be crowbar outside
can have workbench outside
may contain dresser, cabinets,
which may in turn contain canned "meat," shells, shotgun, bandages and gauze
## garage
contains workbench, barrels, crates, dresser
can contain busted van, shipping container
source of engine and wheel voxels
## gas station
large open lean-to structure, convenience store with large broken windows
shelves, cabinets inside
may contain canned "meat" on shelves
may have shotgun (rare), shells (less rare) behind counter  
may have mailbox, barrels, crates, portajohn, billboard, busted van in vicinity
can have garage adjacent
## bunker/vault
partially buried in rock shelf
may contain hostile automatic turret
shelves + cabinets with canned "meat," bandages and gauze, shotgun(s), shells
## railway building
two-story building
https://en.wikipedia.org/wiki/Missolonghi#/media/File:Messologi_station_building.jpg
surrounded by barrels, crates
contains shelves, dressers, workbench
## warehouse
garage XL
high ceilings, perhaps multiple open walls, perhaps mezzanine
may contain shipping containers, trailer, barrels, crates
## rickety watch tower
may contain hostile automatic turret
dresser with canned "meat," bandages and gauze, shotgun(s), shells
## outpost
small buildings attached to rock face, bridge between?
may house hostile bandits?
dresser with canned "meat," bandages and gauze, shotgun(s), shells

# items
## crowbar
used to break down doors, or arbitrary "soft" voxels, making more areas accessible when scavenging.
also more effective against enemies.
found outside portajohns, shipping containers, trailers, gas station.

## bandages and gauze
usable item, instantly renews health

## canned "meat" / cactus meat
usable item, fills food bar

## cactus seeds
placable item, plant in oases to grow cacti

## shotgun
capable of doing everything the crowbar can, from a range if shells are avaiable
with shells, can break greater variety and volume of voxels than crowbar
## shotgun shells
without these, the shotgun is a crowbar

## metal sheet
useful for building or repairing structures.

## screws
useful for building or repairing structures.

## pipes
can be placed through hammer to extend oases 

## hammer
can orient new voxel grid
can place a pane of floor, stairs or wall voxels.
can place shelves, railing, door, window voxel pane.
uses metal sheets, screws
pipes for extending oases placed here

## skull
decorative placable item

## engine, wheel, chair voxels
for vehicle structures
