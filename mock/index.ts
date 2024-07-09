const fenceRes = {
  fence: [
    {
      id: 1,
      points: [
        [-7930, 7120],
        [3449, 7120],
        [117010, 5629],
        [162750, 4170],
        [199760, 6380],
        [206230, 31710],
        [216190, 88140],
        [223490, 85820],
        [215859, 43330],
        [214030, 34040],
        [213705, 24977],
        [208329, 7010],
        [207410, -6919],
        [195509, -5629],
        [156300, -6370],
        [86611, -4509],
        [75520, -3800],
        [35210, -2890],
        [-7930, -1950],
        [-7930, 7120],
      ],
      type: 0,
    },
  ],
};

const pointRes = {
  point: [
    {
      id: 0,
      pos: [210451, 34693],
    },
    {
      id: 1,
      pos: [214896, 59208],
    },
    {
      id: 2,
      pos: [218064, 77790],
      turn: true,
    },
    {
      id: 3,
      pos: [207006, 17519],
    },
    {
      id: 4,
      pos: [60230, 1460],
      turn: true,
    },
    {
      id: 5,
      pos: [195509, -1039],
    },
    {
      id: 6,
      pos: [202740, 3350],
    },
    {
      id: 7,
      pos: [117010, 155],
      turn: true,
    },
    {
      id: 8,
      pos: [162750, -1039],
      turn: true,
    },
    {
      id: 9,
      pos: [223490, 85820],
    },
    {
      id: 10,
      pos: [6002, 1480],
      turn: true,
    },
    {
      id: 11,
      pos: [26003, 1480],
    },
    {
      id: 12,
      pos: [199760, 6380],
    },
    {
      id: 13,
      pos: [86611, 760],
    },
  ],
};

const lineRes = {
  line: [
    {
      direction: 0,
      gait: 0,
      id: 0,
      point: [0, 1],
      radar: 1,
      speed: 1,
    },
    {
      direction: 0,
      gait: 0,
      id: 1,
      point: [1, 2],
      radar: 1,
      speed: 1,
    },
    {
      direction: 0,
      gait: 0,
      id: 2,
      point: [3, 0],
      radar: 1,
      speed: 1,
    },
    {
      direction: 0,
      gait: 0,
      id: 3,
      point: [5, 6],
      radar: 1,
      speed: 1,
    },
    {
      direction: 0,
      gait: 0,
      id: 4,
      point: [6, 3],
      radar: 1,
      speed: 1,
    },
    {
      direction: 1,
      gait: 0,
      id: 5,
      point: [9, 9],
      radar: 1,
      speed: 1,
    },
    {
      direction: 0,
      gait: 0,
      id: 6,
      point: [10, 11],
      radar: 1,
      speed: 1,
    },
    {
      direction: 1,
      gait: 0,
      id: 7,
      point: [12, 12],
      radar: 1,
      speed: 1,
    },
    {
      direction: 0,
      gait: 0,
      id: 8,
      point: [11, 4],
      radar: 1,
      speed: 1,
    },
    {
      direction: 0,
      gait: 0,
      id: 9,
      point: [7, 8],
      radar: 1,
      speed: 1,
    },
    {
      direction: 0,
      gait: 0,
      id: 10,
      point: [8, 5],
      radar: 1,
      speed: 1,
    },
    {
      direction: 0,
      gait: 0,
      id: 11,
      point: [4, 13],
      radar: 1,
      speed: 1,
    },
    {
      direction: 0,
      gait: 0,
      id: 12,
      point: [13, 7],
      radar: 1,
      speed: 1,
    },
  ],
};

export default [
  { url: "/patro/map/point", method: "get", response: () => pointRes },
  { url: "/patro/map/fence", method: "get", response: () => fenceRes },
  { url: "/patro/map/line", method: "get", response: () => lineRes },
  {
    url: "/patro/navigation/plan",
    method: "post",
    response: () => ({
      code: 0,
      msg: "ok",
      path: [[31230, -960], [31231, 540], [31232, 1476], 11, 10, 11, 4, 13],
    }),
  },
];
