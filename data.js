// data.js

class Plant {
  constructor(
    name,
    growthTime,
    seedOutput,
    seedRange,
    harvestOutput,
    harvestRange,
    sellPrice,
    seasons = ["Spring", "Summer", "Autumn", "Winter"],
    seasonBonus = {}
  ) {
    this.name = name;
    this.growthTime = growthTime * 60 * 1000; // convert to milliseconds
    this.seedOutput = seedOutput;
    this.seedRange = seedRange;
    this.harvestOutput = harvestOutput;
    this.harvestRange = harvestRange;
    this.sellPrice = sellPrice;
    this.seasons = seasons;
    this.seasonBonus = seasonBonus;
  }
}

const plantList = [
  new Plant("Wheat", 2, 5, 1, 10, 2, 4),
  new Plant("Carrot", 4, 2, 1, 5, 2, 10, ["Spring", "Autumn"]),
  new Plant("Tomato", 8, 3, 1, 7, 2, 16, ["Summer"], {"Summer": 1.5}),
  new Plant("Pumpkin", 18, 4, 1, 10, 3, 25, ["Autumn"], {"Autumn": 1.5}),
  new Plant("Corn", 12, 3, 1, 8, 2, 22, ["Summer", "Autumn"]),
  new Plant("Potato", 6, 2, 1, 7, 2, 14, ["Spring"]),
  new Plant("Strawberry", 15, 4, 1, 9, 2, 28, ["Spring"], {"Spring": 1.5}),
  new Plant("Blueberry", 16, 4, 1, 10, 2, 29, ["Summer"], {"Summer": 1.5}),
  new Plant("Apple", 30, 5, 1, 18, 3, 36, ["Autumn"], {"Autumn": 1.5}),
  new Plant("Grapes", 18, 3, 1, 9, 2, 23, ["Autumn"]),
  new Plant("Onion", 8, 2, 1, 6, 2, 15, ["Summer"]),
  new Plant("Garlic", 7, 2, 1, 5, 2, 13, ["Spring"]),
  new Plant("Peach", 28, 5, 1, 17, 3, 34, ["Summer"], {"Summer": 1.5}),
  new Plant("Pineapple", 22, 4, 1, 15, 2, 30, ["Summer"]),
  new Plant("Radish", 5, 2, 1, 5, 2, 10, ["Spring"]),
  new Plant("Cabbage", 10, 3, 1, 7, 2, 19, ["Summer"]),
  new Plant("Turnip", 2, 2, 1, 4, 1, 5, ["Spring"]),
  new Plant("Watermelon", 26, 4, 1, 13, 2, 33, ["Summer"], {"Summer": 1.5}),
  new Plant("Mango", 30, 5, 1, 18, 3, 36, ["Summer"]),
  new Plant("Coconut", 28, 4, 1, 17, 3, 34, ["Summer"]),
  new Plant("Beetroot", 12, 3, 1, 6, 2, 18, ["Autumn"]),
  new Plant("Lettuce", 5, 2, 1, 5, 2, 10, ["Spring"]),
  new Plant("Zucchini", 10, 3, 1, 7, 2, 19, ["Summer"]),
  new Plant("Chili", 11, 3, 1, 8, 2, 21, ["Summer"], {"Summer": 1.2})
];
