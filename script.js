
  // --- Game Classes ---
  class PlotCell {
    constructor() {
      this.plant = null;
      this.plantedTime = null;
      this.level = 0;
    }
  
    plantSeed(plant, currentSeason) {
      if (this.plant || !plant.seasons.includes(currentSeason)) return false;
      this.plant = plant;
      this.plantedTime = Date.now();
      return true;
    }
  
    isFullyGrown() {
      return this.plant && (Date.now() - this.plantedTime >= this.plant.growthTime);
    }
  
    harvest(currentSeason) {
      if (!this.isFullyGrown()) return null;
  
      const bonus = 1.1 ** this.level;
      const seasonMult = this.plant.seasonBonus[currentSeason] || 1;
      const seeds = Math.floor(randomRange(this.plant.seedOutput, this.plant.seedRange) * bonus * seasonMult);
      const harvestAmt = Math.floor(randomRange(this.plant.harvestOutput, this.plant.harvestRange) * bonus * seasonMult);
  
      const result = {
        name: this.plant.name,
        seeds,
        harvestAmt
      };
  
      this.plant = null;
      this.plantedTime = null;
  
      return result;
    }
  
    upgradeCost() {
      return Math.floor(100 * (1.2 ** this.level));
    }
  
    getDisplayChar() {
      if (!this.plant) return '';
      const progress = (Date.now() - this.plantedTime) / this.plant.growthTime;
      if (progress < 0.1) return '.';
      if (progress >= 1) return this.plant.name[0].toUpperCase();
      return this.plant.name[0].toLowerCase();
    }
  }
  
  // --- Utilities ---
  function randomRange(base, range) {
    return Math.floor(Math.random() * (range * 2 + 1)) + base - range;
  }
  
  function getSeason() {
    const hour = new Date().getHours();
    if (hour < 10) return "Spring";
    if (hour < 13) return "Summer";
    if (hour < 15) return "Autumn";
    return "Winter";
  }
  
  // --- Game State ---
  const gridSize = 10;
  let farm = [];
  let selectedX = 0;
  let selectedY = 0;
  let selectedPlant = plantList[0];
  let inventory = { "Gold": 100 };
  plantList.forEach(p => {
    inventory[p.name] = 0;
    inventory[`${p.name} Seeds`] = 5;
  });
  
  let isMouseDown = false;
  let isShift = false;
  let mouseButton = null;
  
  // --- Setup UI ---
  const gameBoard = document.getElementById('gameBoard');
  const seedSelector = document.getElementById('seedSelector');
  const messageArea = document.getElementById('messageArea');
  const inventoryList = document.getElementById('inventoryList');
  const inventoryPanel = document.getElementById('inventoryPanel');
  
  // Update the seed selector with options and attach the wheel event listener.
  function renderSeedSelector() {
    plantList.forEach((plant, i) => {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = plant.name;
      seedSelector.appendChild(option);
    });
  
    // When the user changes selection by clicking
    seedSelector.addEventListener('change', (e) => {
      selectedPlant = plantList[e.target.value];
    });
    
    // Add mouse scroll (wheel) event
    seedSelector.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY;
      let currentIndex = seedSelector.selectedIndex;
      const currentSeason = getSeason();
      const filterCheckbox = document.getElementById("plantableOnlyCheckbox");
  
      // If filtering is enabled, filter for plantable plants only
      if (filterCheckbox.checked) {
        // Create an array of objects with plant and index
        const filtered = plantList.map((p, index) => ({ plant: p, index }))
                                   .filter(obj => obj.plant.seasons.includes(currentSeason));
        
        if (filtered.length === 0) {
          // Fallback: if no plants are available for the current season
          showMessage(`No plants available for ${currentSeason}.`);
          return;
        }
        
        // Find the index within the filtered array that matches the current selection
        let filteredIndex = filtered.findIndex(obj => obj.index === currentIndex);
        if (filteredIndex === -1) {
          // If the currently selected plant is not plantable this season, reset to first filtered element.
          filteredIndex = 0;
        }
        
        // Cycle based on scroll direction.
        if (delta > 0) {
          filteredIndex = (filteredIndex + 1) % filtered.length;
        } else {
          filteredIndex = (filteredIndex - 1 + filtered.length) % filtered.length;
        }
        
        // Update seed selector with the new selection
        const newIndex = filtered[filteredIndex].index;
        seedSelector.selectedIndex = newIndex;
        selectedPlant = plantList[newIndex];
      } else {
        // Otherwise, cycle through all plants normally.
        const total = seedSelector.options.length;
        if (delta > 0) {
          currentIndex = (currentIndex + 1) % total;
        } else {
          currentIndex = (currentIndex - 1 + total) % total;
        }
        seedSelector.selectedIndex = currentIndex;
        selectedPlant = plantList[currentIndex];
      }
    });
  }
  
  function buildGrid() {
    farm = [];
    gameBoard.innerHTML = '';
  
    for (let y = 0; y < gridSize; y++) {
      const row = [];
      for (let x = 0; x < gridSize; x++) {
        const cell = new PlotCell();
        row.push(cell);
  
        const div = document.createElement('div');
        div.classList.add('tile', 'empty');
        div.dataset.x = x;
        div.dataset.y = y;
  
        // Fixed: Correct scoping using IIFE
        (function(x, y, cell, div) {
          div.addEventListener('mousedown', (e) => {
            selectedX = x;
            selectedY = y;
            isShift = e.shiftKey;
            mouseButton = e.button;
  
            if (mouseButton === 0) {
              isShift ? upgradeTile() : plantSeed();
            } else if (mouseButton === 2) {
              harvest();
            }
          });
  
          div.addEventListener('mouseenter', () => {
            const info = getTileInfo(cell);
            document.getElementById('hoverInfo').textContent = `Tile (${x}, ${y}): ${info}`;
            if (isMouseDown) {
              selectedX = x;
              selectedY = y;
              if (mouseButton === 0) {
                isShift ? upgradeTile() : plantSeed();
              } else if (mouseButton === 2) {
                harvest();
              }
            }
          });
  
          div.addEventListener('mouseleave', () => {
            document.getElementById('hoverInfo').textContent = '';
          });
        })(x, y, cell, div);
  
        gameBoard.appendChild(div);
      }
      farm.push(row);
    }
  }
  
  document.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    isShift = e.shiftKey;
    mouseButton = e.button;
  });
  
  document.addEventListener('mouseup', () => {
    isMouseDown = false;
    mouseButton = null;
  });
  
  document.addEventListener('contextmenu', e => e.preventDefault()); // Disable right-click menu
  
  function renderGrid() {
    const season = getSeason();
    document.getElementById('seasonDisplay').textContent = `Season: ${season}`;
    document.getElementById('goldDisplay').textContent = `Gold: ${inventory["Gold"]}`;
  
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const index = y * gridSize + x;
        const tile = gameBoard.children[index];
        const cell = farm[y][x];
        const char = cell.getDisplayChar();
  
        tile.textContent = char;
        tile.classList.toggle('selected', x === selectedX && y === selectedY);
      }
    }
  
    updateInventoryUI();
  }
  
  function updateInventoryUI() {
    inventoryList.innerHTML = '';
    inventoryList.innerHTML += `<div><strong>Gold</strong>: ${inventory["Gold"]}</div>`;
    plantList.forEach(p => {
      inventoryList.innerHTML += `<div>${p.name}: ${inventory[p.name]} | Seeds: ${inventory[`${p.name} Seeds`]}</div>`;
    });
  }
  
  function plantSeed() {
    const cell = farm[selectedY][selectedX];
    const seedKey = `${selectedPlant.name} Seeds`;
    if (inventory[seedKey] <= 0) return showMessage(`No ${selectedPlant.name} seeds!`);
  
    const success = cell.plantSeed(selectedPlant, getSeason());
    if (success) {
      inventory[seedKey]--;
      showMessage(`Planted ${selectedPlant.name}`);
    } else {
      showMessage(`Can't plant here or wrong season.`);
    }
  
    renderGrid();
  }
  
  function harvest() {
    const cell = farm[selectedY][selectedX];
    const result = cell.harvest(getSeason());
    if (result) {
      inventory[`${result.name} Seeds`] += result.seeds;
      inventory[result.name] += result.harvestAmt;
      showMessage(`Harvested ${result.name}! +${result.seeds} seeds, +${result.harvestAmt} crops`);
    } else {
      showMessage("Nothing to harvest.");
    }
    renderGrid();
  }
  
  function upgradeTile() {
    const cell = farm[selectedY][selectedX];
    const cost = cell.upgradeCost();
    if (inventory["Gold"] >= cost) {
      cell.level++;
      inventory["Gold"] -= cost;
      showMessage(`Upgraded tile to Lv.${cell.level}`);
    } else {
      showMessage(`Not enough Gold (need ${cost})`);
    }
    renderGrid();
  }
  
  function sellAll() {
    let total = 0;
    plantList.forEach(p => {
      const count = inventory[p.name];
      total += count * p.sellPrice;
      inventory[p.name] = 0;
    });
    inventory["Gold"] += total;
    showMessage(`Sold all crops for ${total} Gold!`);
    renderGrid();
  }
  
  function toggleInventory() {
    inventoryPanel.classList.toggle('hidden');
  }
  
  function showMessage(msg) {
    messageArea.textContent = msg;
  }
  
  function getTileInfo(cell) {
    if (!cell) return '';
    if (!cell.plant) return `Empty | Upgrade Lv. ${cell.level}`;
  
    const remaining = Math.max(0, Math.floor((cell.plant.growthTime - (Date.now() - cell.plantedTime)) / 1000));
    return `${cell.plant.name} | ${remaining}s left | Lv. ${cell.level}`;
  }
  
  // --- Save/Load ---
  function saveGame() {
    const saveData = {
      farm: farm.map(row => row.map(cell => ({
        plant: cell.plant?.name || null,
        plantedTime: cell.plantedTime,
        level: cell.level
      }))),
      inventory
    };
    localStorage.setItem('farmSave', JSON.stringify(saveData));
    showMessage("Game saved.");
  }
  
  function loadGame() {
    const data = localStorage.getItem('farmSave');
    if (!data) return showMessage("No save found.");
    const { farm: farmData, inventory: savedInventory } = JSON.parse(data);
  
    farmData.forEach((row, y) => {
      row.forEach((cellData, x) => {
        const cell = farm[y][x];
        cell.plant = plantList.find(p => p.name === cellData.plant) || null;
        cell.plantedTime = cellData.plantedTime;
        cell.level = cellData.level || 0;
      });
    });
  
    inventory = savedInventory;
    showMessage("Game loaded.");
    renderGrid();
  }
  
  // --- Start ---
  renderSeedSelector();
  buildGrid();
  loadGame();
  renderGrid();
  setInterval(renderGrid, 1000);    // UI update every second
  setInterval(() => {
    saveGame();
    showMessage("Game auto-saved.");
  }, 30000); // auto-save every 30s
  
