const db = require("../config/db");

// ------------------ PHIẾU NHẬP/XUẤT ------------------
exports.createTicket = async (ticket) => {
  const [result] = await db.execute(
    `INSERT INTO inventory_tickets (type, supplier_id, user_id, note, order_id)
     VALUES (?, ?, ?, ?, ?)`,
    [ticket.type, ticket.supplier_id || null, ticket.user_id, ticket.note || "", ticket.order_id || null]
  );
  return result.insertId;
};

exports.addItems = async (items, ticketId) => {
  const values = items.map(item => [
    ticketId,
    item.product_id,
    item.quantity,
    item.import_price || null,
    item.import_price ? item.quantity : null // chỉ gán nếu là phiếu nhập
  ]);

  await db.query(
    `INSERT INTO inventory_items (ticket_id, product_id, quantity, import_price, remaining_quantity)
     VALUES ?`,
    [values]
  );

  // Đồng bộ lại tổng tồn kho của từng sản phẩm sau khi thêm lô mới
  for (const item of items) {
    // Cập nhật giá nhập mới nhất vào bảng products
      if (item.import_price) {
        await db.query(
          `UPDATE products SET import_price = ? WHERE id = ?`,
          [item.import_price, item.product_id]
        );
      }
    //  Đồng bộ lại tổng tồn kho từ các lô
    const [[{ total_stock }]] = await db.query(`
      SELECT SUM(remaining_quantity) AS total_stock
      FROM inventory_items
      WHERE product_id = ?
    `, [item.product_id]);

    await db.query(
      `UPDATE products SET stock = ? WHERE id = ?`,
      [total_stock || 0, item.product_id]
    );
  }
};

// ------------------ LẤY DỮ LIỆU ------------------
exports.getTickets = async () => {
  const [rows] = await db.execute(`
    SELECT t.id, t.type, t.note, t.created_at, t.status,
           s.name AS supplier_name,
           u.name AS user_name
    FROM inventory_tickets t
    LEFT JOIN suppliers s ON t.supplier_id = s.id
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at DESC
  `);
  return rows;
};

exports.getTicketDetails = async (ticketId) => {
  const [items] = await db.execute(`
    SELECT i.id, i.quantity, i.import_price, i.remaining_quantity,
           p.name AS product_name
    FROM inventory_items i
    JOIN products p ON i.product_id = p.id
    WHERE i.ticket_id = ?
  `, [ticketId]);
  return items;
};

exports.getTicketById = async (ticketId) => {
  const [rows] = await db.execute(`
    SELECT t.id, t.type, t.note, t.created_at,
           u.name AS user_name,
           s.name AS supplier_name
    FROM inventory_tickets t
    JOIN users u ON t.user_id = u.id
    LEFT JOIN suppliers s ON t.supplier_id = s.id
    WHERE t.id = ?
  `, [ticketId]);
  return rows[0];
};

// ------------------ XỬ LÝ FIFO ------------------

// Trừ tồn kho theo FIFO, ghi log vào inventory_movements
exports.deductStockFIFO = async (product_id, quantity, order_id = null, note = null) => {
  let remaining = quantity;
  let totalCost = 0;
  let totalQty = 0;

  const [batches] = await db.execute(`
    SELECT id, remaining_quantity, import_price
    FROM inventory_items
    WHERE product_id = ? AND remaining_quantity > 0
    ORDER BY id ASC
  `, [product_id]);

  if (batches.length === 0)
    throw new Error(`Không có hàng tồn cho sản phẩm ID ${product_id}`);

  for (const batch of batches) {
    if (remaining <= 0) break;

    const take = Math.min(batch.remaining_quantity, remaining);
    remaining -= take;
    totalQty += take;
    totalCost += take * batch.import_price;

    // Trừ kho
    await db.execute(
      `UPDATE inventory_items SET remaining_quantity = remaining_quantity - ? WHERE id = ?`,
      [take, batch.id]
    );

    // Ghi log xuất hàng + ghi chú (nếu có)
    await db.execute(`
      INSERT INTO inventory_movements (order_id, product_id, inventory_item_id, quantity, type, note)
      VALUES (?, ?, ?, ?, 'export', ?)
    `, [order_id, product_id, batch.id, take, note]);
  }

  if (remaining > 0)
    throw new Error(`Không đủ tồn kho cho sản phẩm ID ${product_id}`);

  // Đồng bộ lại tổng tồn kho sau khi xuất hàng
  const [[{ total_stock }]] = await db.query(`
    SELECT SUM(remaining_quantity) AS total_stock
    FROM inventory_items
    WHERE product_id = ?
  `, [product_id]);

  await db.query(
    `UPDATE products SET stock = ? WHERE id = ?`,
    [total_stock || 0, product_id]
  );

  const unitCost = totalQty ? totalCost / totalQty : 0;
  return { totalCost, unitCost };
};

// Tính giá vốn mà không trừ tồn kho
exports.calculateCostPriceFIFO = async (product_id, quantity) => {
  let remaining = quantity;
  let totalCost = 0;
  let totalQty = 0;

  const [batches] = await db.execute(`
    SELECT remaining_quantity, import_price
    FROM inventory_items
    WHERE product_id = ? AND remaining_quantity > 0
    ORDER BY id ASC
  `, [product_id]);

  for (const batch of batches) {
    if (remaining <= 0) break;
    const take = Math.min(batch.remaining_quantity, remaining);
    remaining -= take;
    totalQty += take;
    totalCost += take * batch.import_price;
  }

  if (remaining > 0)
    throw new Error("Không đủ tồn kho để tính giá vốn");

  const unitCost = totalQty ? totalCost / totalQty : 0;
  return { totalCost, unitCost };
};

// Hoàn kho chính xác theo log (khi đơn bị hủy)
exports.restoreStockFIFO = async (order_id) => {
  // Lấy các lô đã xuất liên quan đến đơn này
  const [movements] = await db.execute(`
    SELECT inventory_item_id, product_id, quantity
    FROM inventory_movements
    WHERE order_id = ? AND type = 'export'
  `, [order_id]);

  if (movements.length === 0) return; // Không có gì để hoàn kho

  for (const mv of movements) {
    // Cộng lại tồn kho đúng lô
    await db.execute(`
      UPDATE inventory_items
      SET remaining_quantity = remaining_quantity + ?
      WHERE id = ?
    `, [mv.quantity, mv.inventory_item_id]);

    // Ghi log nhập lại kho (để vẫn hiện trong lịch sử)
    const [[order]] = await db.query(
      "SELECT order_code FROM orders WHERE id=?",
      [order_id]
    );
    const note = `Hoàn kho do hủy đơn hàng ${order.order_code}`;
    await db.execute(`
      INSERT INTO inventory_movements (order_id, product_id, inventory_item_id, quantity, type, note)
      VALUES (?, ?, ?, ?, 'import', ?)
    `, [order_id, mv.product_id, mv.inventory_item_id, mv.quantity, note]);
  }

      await db.execute(`
        UPDATE inventory_movements
        SET is_reverted = 1
        WHERE order_id = ? AND type = 'export'
      `, [order_id]);

  // Đồng bộ lại tổng tồn kho cho các sản phẩm liên quan
  const productIds = [...new Set(movements.map(m => m.product_id))];
  for (const product_id of productIds) {
    const [[{ total_stock }]] = await db.query(`
      SELECT SUM(remaining_quantity) AS total_stock
      FROM inventory_items
      WHERE product_id = ?
    `, [product_id]);

    await db.query(
      `UPDATE products SET stock = ? WHERE id = ?`,
      [total_stock || 0, product_id]
    );
  }
};


// ------------------ THỐNG KÊ ------------------
exports.getProductStock = async (product_id) => {
  const [rows] = await db.execute(`
    SELECT SUM(remaining_quantity) AS stock
    FROM inventory_items
    WHERE product_id = ?
  `, [product_id]);
  return rows[0].stock || 0;
};

exports.calculateProfit = async (order_id) => {
  const [items] = await db.execute(`
    SELECT price, quantity, cost_price
    FROM order_items
    WHERE order_id = ?
  `, [order_id]);

  let totalProfit = 0;
  for (const item of items) {
    totalProfit += (item.price - item.cost_price) * item.quantity;
  }
  return totalProfit;
};

exports.checkAvailableStock = async (product_id) => {
  const [rows] = await db.execute(`
    SELECT SUM(remaining_quantity) AS total
    FROM inventory_items
    WHERE product_id = ?
  `, [product_id]);
  return rows[0].total || 0;
};
