# Dumb Voronoi for beating up 3D models

Recently, I wanted to dynamically deform some 3D models.
Actually. I wanted to do more than just deform them.
I wanted to beat the shit out of them with a crowbar.
I wanted to watch them fracture into a million tiny little pieces.
I wanted them to pay for everything they did to my ...

Well, anyway. It turns out that Shadertoy wizards have a trick they use for generating
everything from broken glass to dry desert terrain, namely Voronoi noise.

They generate it like this:
```
for every pixel (x, y) on the screen:
  find out what "tile" this x and y is in 
  for all of the "tiles" around me:
    look up what the random point is in that tile
    get the distance between me (aka this pixel) and that point
    if i'm closer to this tile's point than any other so far,
      store that distance!
  set this pixel's color based on that minimum distance
```
This lets you supply points of interest -- in this case, each tile's random point -- and then 
the places that are farthest from the points of interest will be a crisp white.
You can see an interactive demo of this here: https://thebookofshaders.com/12/
  
So in my case, I could put two points of interest where my crowbar's forked end smashes into the surface,
and I'd get a nice long split on the axis between the points. Not bad.

The only problem is, my 3D model is ... vector, not raster. There are no pixels on which to do calculations.
Even if I put a fake pixel grid over my models for this purpose (gross), all I'd get back was pixel colors
(more gross) and while that might work out alright for texturing the surface, what about when I want to punch a
hole in that mf?

Just call [discard](https://www.khronos.org/opengl/wiki/Fragment#Fragment_discard) in the shader to make it look like the geometry is missing? Sure, but what about my physics code?

Use some fancy edge detection to turn those pixels back into geometry? _Hell_ no. This article is titled _Dumb_ Voronoi, not "Big Brain 500IQ Voronoi." Besides, I wanted this to be fast and simple so it could work in real time. Exacting my nefarious revenge on 3D models had to be buttery smooth, otherwise, what's the point?

So I did more research, and I found out a couple interesting things:
1. I might be using Voronoi to break up 3D models, but Voronoi is actually deeply entertwined with this thing called Delaunay triangulation, _which people use to **make** 3D models from collections of points ..._ so I started feeling like I was really on to something.
2. There _are_ geometric implementations of Voronoi. Hell, there are even really fast ones cooked up all the way back in '86 by legendary Bell Labs C hackers. https://web.archive.org/web/20131006193257/http://ect.bell-labs.com/who/sjf/

I grabbed an npm module that implemented the Bell Labs algorithm and got something working right away.
I wanted to make a playground for Voronoi where I could place, delete, and move around points.
The thinking was, this would give me an intuition for how I could use Voronoi for mesh deformation.

I also wanted to make my own implementation of Voronoi so that I could develop a full-fledged understanding
of this tool that was critical for the problem I was trying to solve (and so much more in computer graphics!)
I went ahead and modified the playground so that the output of my implementation was overlaid
on top of the canonical one.

I read the 1500 lines of the JavaScript port of the Bell Labs Voronoi implementation several times over, and
implemented the parts I could immediately understand, using my playground to visualize the intermediate results.

After writing and deleting a lot of code, I finally understood the core of the approach that was used. It was only about 100 lines long. Everything else, I realized, was just optimization on top of that core.

## What we need
Since we're deforming 3D models, we aren't interested in the pixels of the voronoi diagram like those Shadertoy wizards.
Rather, the parts that are interesting to us -- what we need to find -- are the "vertices," and the "edges" that connect them.

## What we have
We have points of interest, or places where the vertices _aren't_. The shadertoy wizards generate these by
tiling up the world and placing one point in each tile, but in the playground you can put the points wherever you like. In the final application, there will be points of interest based on where the player strikes the surface (so the playground isn't too far off!).

> where the vertices aren't
Actually, the vertices in a Voronoi diagram aren't just "not where the points of interest are," they're actually exactly where you'd be if you picked 3 points and went to somewhere equidistant from all three.

It's really that simple. If you want all possible voronoi vertex positions, just loop over all your points of interest, divide them into every possible grouping of three, and use math to find the point they're all the same distance from.
```
  for (const cntr of points) {
    for (const left of points) {
      for (const rigt of points) {
        /* we need _unique_ pairings without duplicates */
        if (cntr == left) continue;
        if (cntr == rigt) continue;
        if (left == rigt) continue;
        
        /* find point equidistant to cntr, left, and rigt */
        /* it might be a voronoi point! */
```

## Equi-what-now?
Getting a point equidistant to three other points is actually kind of tricky.
You can't just average them; imagine a straight line of points. The average would
be the the exact same as one in the middle, which is of course going to be closer
to the point in the middle than any of the other ones.

The trick here is knowing to google for "circumcircle."
A circumcircle is a circle that goes through every point on a polygon.
As we all know, every point on a circle is the same distance from the center.
If you have the circumcircle of the triangle formed by our three points,
then you have the point equidistant from all points of interest.

There are a bunch of ways to [find the circumcircle on wikipedia](https://en.wikipedia.org/wiki/Circumscribed_circle).
I found the approach which used the cross and dot products to be the easiest to translate into code. 

```
        const bx = cntr.x,
              by = cntr.y,
              ax = left.x - bx,
              ay = left.y - by,
              cx = rigt.x - bx,
              cy = rigt.y - by;

        let d = 2*(ax*cy-ay*cx);
        if (d >= -2e-12) continue;

        const ha = ax*ax + ay*ay,
              hc = cx*cx + cy*cy,
              x = (cy*ha - ay*hc)/d + bx,
              y = (ax*hc - cx*ha)/d + by;
```

The only part that may come as a surprise is the bit with `d` there.
As you may know from previous forays into computational geometry, the sign of the cross product can be used to determine the "winding" (whether the points go clockwise or counter-clockwise) of a polygon.

The way we generate groupings of points, if we have 3 points of interest, A, B, and C, then our for loop is going
to give us "ABC", "BCA", "CAB" etc. We can use `d` to filter out half of these based on whether or not the spinning arm of a clock would go through the points in the order they've been presented in.

If the points are in a straight line -- a triangle with no area -- `d` is going to be zero. So we'll want to filter out d=0 as well as d>0.

## Milestone: All possible vertex locations generated!
So far, we generate all possible vertex locations. The code looks like this:

```
function dumb_voronoi(points) {
  const vertices = [];

  for (const cntr of points) {
    for (const left of points) {
      for (const rigt of points) {
        /* we need _unique_ pairings without duplicates */
        if (cntr == left) continue;
        if (cntr == rigt) continue;
        if (left == rigt) continue;
        
        /* find point equidistant to cntr, left, and rigt */
        /* it might be a voronoi point! */

        const bx = cntr.x,
              by = cntr.y,
              ax = left.x - bx,
              ay = left.y - by,
              cx = rigt.x - bx,
              cy = rigt.y - by;

        let d = 2*(ax*cy-ay*cx);
        if (d >= -2e-12) continue;

        const ha = ax*ax + ay*ay,
              hc = cx*cx + cy*cy,
              x = (cy*ha - ay*hc)/d + bx,
              y = (ax*hc - cx*ha)/d + by;

         vertices.push({ x, y });
       }
    }
  }
  
  return vertices;
}
```

The performance is ... yeah, cubic, but we said this was dumb voronoi!

We also have a couple other issues.
We generate a lot of redundant points, and we generate a lot of points that _could_ have been voronoi points,
but aren't actually.
A vertex equidistant from three points of interest is only going to be on our Voronoi graph _if it's closer to those three points than any other points on the graph_.

## Validating Voronoi Vertices
Our voronoi vertices are squeamish, fearful little things. They're cockroaches, trying to find optimally dark places in a world filled with light sources. A point equally far from 3 individual light sources might be a good bet, _if_ there isn't another light source right there ruining everything!!!

So what's our dumb voronoi solution to this?
```
        function dist_point_to_point(x0, y0, x1, y1) {
          const dx = x0-x1;
          const dy = y0-y1;
          return Math.sqrt(dx*dx + dy*dy);
        }

        const v = { x, y };
        points0.sort((a, b) => dist_point_to_point(a.x, a.y, v.x, v.y) -
                               dist_point_to_point(b.x, b.y, v.x, v.y));
        let shared = (points0[0] == cntr || points0[0] == left || points0[0] == rigt) +
                     (points0[1] == cntr || points0[1] == left || points0[1] == rigt) +
                     (points0[2] == cntr || points0[2] == left || points0[2] == rigt) ;
        if (shared == 3)
          vertices.push(v);
```
Yup. That's right. A voronoi vertex is valid if it's equidistant from three points and those three points are the closest points to where the vertex is. So we sort all of the points by how far away they are from the vertex and make sure the top 3 includes the points who spawned us.

Note `points0`. We don't want to re-sort the array _while we're iterating through it,_ (That'd be a disaster.
I totally didn't accidentally do that and confuse the hell out of myself. Ha. Ha.) So we make a copy for
sorting right before we kick things off. (If we were smart, we would copy into a better data structure, like
a spatial hashmap, so we don't have to sort through _every single point_ to find the 3 closest to the vertex
that we're validating, buuuuut ... this is dumb Voronoi! Yay!)

## Removing Redundant Roaches
We remove about half of the redundant vertices just using our trick with the cross product stored in `d`,
buuut choosing 3 permutations from a bank of 3 points of interest with no repetition is 3 factorial ... or 6
permutations, so there are still 3 redundant roaches per POI triangle ... and while I'm completely okay
with a _slow_ solution to start off with, it has to give me geometry I can _use_, which means no
duplicate vertices! (Duplicate vertices would make it more difficult to generate edges in the next step.)

```
  /* we sort to find the three nearest points to a vert,
   * but we don't want to sort the array while we're iterating
   * through it, so ... make a copy! */
  const points0 = [...points];
  const edges = [];
  const vertices = new Map();

  for (const cntr_i in points) { const cntr = points[cntr_i];
    for (const left_i in points) { const left = points[left_i];
      for (const rigt_i in points) { const rigt = points[rigt_i];

        /* if we order the sites by their indices, we'll get the same ordering
         * no matter what order cntr, left, and rigt are in */
        const site0 = Math.min(cntr_i, left_i, rigt_i);
        const site2 = Math.max(cntr_i, left_i, rigt_i);
        const site1 =  (cntr_i != site0 && cntr_i != site2) ? cntr_i :
                      ((left_i != site0 && left_i != site2) ? left_i : rigt_i);

        const full_key = site0 + ',' + site1 + ',' + site2;
        if (vertices.has(full_key)) continue;

        /* do math to find vertex */

        /* if the vertex isn't close to the POIs that spawned it,
         * write "false" into "vertices" to save subsequent iterations
         * from having to do the math. */

        /* if it IS a valid voronoi vertex, write the whole { x, y } object into the map! */
```

## Being Edgy
We can actually use a very similar approach for generating the edges to the one we used for
removing the redundant vertices.

First, we have to ask ourselves, where do the edges actually appear in the graph? Which vertices
have lines drawn between them?

Hint: It's the vertices that share 2 parent POIs. If they share 3, well, they're just the same vertex.
We use that information to filter out redundant vertices. But if they share 2 parent POIs, their vertices are connected.

We can keep a separate map for edge hookups, we'll call it `vmap`, and instead of indexing it with `full_key`s,
that contain all three indices, we'll use shorter 2-index keys. We'll still make sure the indices are in ascending
order, so there are no missed hookups.

The Bell Labs implementation uses a completely different method for creating the edges that involves
a lot of book-keeping and keeping track of linked-list nodes _while_ you're iterating through the points. I figured this less rote version of edge placement out while just staring at the graph.

```
            const key0 = site0 + ',' + site1;
            const key1 = site1 + ',' + site2;
            const key2 = site0 + ',' + site2;
            for (const key of [key0, key1, key2]) {
              if (vmap.has(key)) {
                edges.push({ l: vmap.get(key), r: v });
                vmap.delete(key)
              }
              else vmap.set(key, v);
```

## Dumb Voronoi
```
  return { vertices: [...vertices.values()], edges };
```
That's really all there is to it. From POIs to edges and vertices in 100 lines of code.

If you profile it, you'll see why it's dumb voronoi. Two areas are really hot:
1. The cubic loop. O(n^3) performance, baby!
2. The distance sort. You're comparing raw distances, so you can get rid of the `Math.sqrt` as a simple optimization, but the real kicker here is the O(nlog n) sort performance.

The Bell Labs implementation doesn't actually need either of these. It's a lot faster. Like, ridiculously fast.
It doesn't need the cubic loop to find POI triangles because it sweeps across the nodes in one go,
and it doesn't need the distance sort because it keeps track of the distance between the sweep line and
the points of interest to know that "behind these parabolas, we can be certain about where voronoi vertices are irrespective of whatever is behind this line."

But none of that made sense to me, until I made the dumb version first.
