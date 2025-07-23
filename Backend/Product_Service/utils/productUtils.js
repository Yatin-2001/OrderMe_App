const Inventory = require('../models/inventory');

async function findNearestWarehouseWithStock(items, userCoordinates) {
  // Fetch all inventories matching any product in the list and with sufficient quantity
  const productIds = items.map(item => item.productId);

  const inventories = await Inventory.find({
    productId: { $in: productIds },
    quantity: { $gt: 0 }
  }).populate('warehouseId');

  // Organize inventories by warehouse
  const warehouseMap = new Map();

  for (const inv of inventories) {
    const warehouseIdStr = inv.warehouseId._id.toString();

    if (!warehouseMap.has(warehouseIdStr)) {
      warehouseMap.set(warehouseIdStr, {
        warehouse: warehouseIdStr,
        stock: []
      });
    }

    warehouseMap.get(warehouseIdStr).stock.push(inv);
  }

  const validWarehouses = [];

  // Check each warehouse for sufficient stock for all items
  for (const [_, data] of warehouseMap) {
    const stockByProduct = new Map();

    for (const inv of data.stock) {
      stockByProduct.set(inv.productId.toString(), inv.quantity);
    }

    const allItemsAvailable = items.every(item =>
      stockByProduct.has(item.productId.toString()) &&
      stockByProduct.get(item.productId.toString()) >= item.quantity
    );

    if (allItemsAvailable) {
      const distance = getDistance(data.warehouse.coordinates, userCoordinates);
      validWarehouses.push({
        warehouse: data,
        distance
      });
    }
  }

  // Sort by distance
  validWarehouses.sort((a, b) => a.distance - b.distance);

  // Return the nearest valid warehouse or null
  return validWarehouses.length > 0 ? validWarehouses[0].warehouse : null;
}

function getDistance(coord1, coord2) {
  const dx = coord1.lat - coord2.lat;
  const dy = coord1.lng - coord2.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

module.exports = { findNearestWarehouseWithStock };
