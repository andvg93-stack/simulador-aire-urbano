// Diseño vial definitivo integrado en el proyecto.
(() => {
  const edges = `0001 0102 0203 0304 1011 1112 1213 2021 2122 2223 2324 3031 3132 3334 4041 4142 4243 4344 0010 1020 2030 3040 0111 1222 2232 3242 0313 1323 2333 3343 0414 1424 2434 3444`;
  const zebras = `10e 10n 10w 30e 30n 30w 01e 01n 01s 11e 11s 11w 21e 21n 21w 31n 31s 31w 02e 02n 02s 22e 22n 22s 22w 32e 32n 32s 32w 42n 42s 42w 03e 03n 03s 23n 23s 23w 33e 33n 33s 43n 43s 43w 24e 24s 24w 34e 34s 34w`;
  const trees = new Set(`0,0 11,2 11,4 2,5 0,9 1,9 2,9 3,9 11,9 0,10 1,10 2,10 3,10 11,10 1,11 2,11 4,11 6,11 7,11 10,11`.split(" "));
  const directions = { e: "east", n: "north", s: "south", w: "west" };
  window.DEFAULT_ROAD_LAYOUT = {
    version: 2,
    zebraLength: 5.4,
    edges: edges.split(" ").map(value => ({ a: { col: +value[0], row: +value[1] }, b: { col: +value[2], row: +value[3] } })),
    zebras: zebras.split(" ").map(value => ({ col: +value[0], row: +value[1], direction: directions[value[2]] })),
    landUse: Array.from({ length: 144 }, (_, index) => {
      const col = index % 12;
      const row = Math.floor(index / 12);
      return { col, row, type: trees.has(`${col},${row}`) ? "tree" : "building" };
    })
  };
})();
