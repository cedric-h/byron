import bpy
from bpy import data as D
from bpy import context as C
from mathutils import *
from math import *

print({
  'idx': [[i for i in p.vertices] for p in D.meshes[1].polygons],
  'vrt': [[float(str(int(100*f)/100)) for f in x.co] for x in D.meshes[1].vertices]
});
