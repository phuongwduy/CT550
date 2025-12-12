const Inventory = require("../models/inventoryModel");
const db = require("../config/db");

exports.createTicket = async (req, res) => {
  try {
    const { type, supplier_id, note, items } = req.body;
    const user_id = req.user.id;

    console.log("Dữ liệu nhận được:", { type, supplier_id, note, items, user_id });

    // Kiểm tra dữ liệu cơ bản
    if (!type || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Thiếu thông tin phiếu hoặc danh sách sản phẩm." });
    }

    if (type === "import" && !supplier_id) {
      return res.status(400).json({ error: "Phiếu nhập cần có nhà cung cấp." });
    }

    // Kiểm tra từng sản phẩm
    for (const item of items) {
      item.product_id = Number(item.product_id);
      item.quantity = Number(item.quantity);
      item.import_price = Number(item.import_price || 0);

      if (!item.product_id || item.quantity <= 0) {
        return res.status(400).json({
          error: `Thông tin sản phẩm không hợp lệ (ID: ${item.product_id}, SL: ${item.quantity})`
        });
      }

      if (type === "import" && item.import_price <= 0) {
        return res.status(400).json({
          error: `Giá nhập không hợp lệ cho sản phẩm ID ${item.product_id}`
        });
      }
    }

    // Tạo phiếu
    const ticketId = await Inventory.createTicket({ type, supplier_id, user_id, note });

      await Inventory.addItems(
        items.map(item => ({
          ...item,
          import_price: type === "import" ? item.import_price : null
        })),
        ticketId
      );

      

      if (type === "export") {
        for (const item of items) {
          const available = await Inventory.checkAvailableStock(item.product_id);
          if (available < item.quantity) {
            return res.status(400).json({
              error: `Không đủ tồn kho để xuất sản phẩm ID ${item.product_id}. Hiện còn ${available}, yêu cầu ${item.quantity}`
            });
          }

          try {
            // Trừ theo FIFO + ghi log vào inventory_movements
            const { totalCost, unitCost } = await Inventory.deductStockFIFO(
              item.product_id,
              item.quantity,
              ticketId,
              note
            );

            // Lưu thông tin giá vốn xuất vào inventory_items của phiếu
            await db.execute(
              `UPDATE inventory_items
              SET import_price = ?
              WHERE ticket_id = ? AND product_id = ?`,
              [unitCost, ticketId, item.product_id]
            );


          } catch (err) {
            console.error("Lỗi FIFO khi xuất kho:", err);
            return res.status(400).json({
              error: `Lỗi khi trừ tồn kho sản phẩm ID ${item.product_id}`
            });
          }
        }
}



    res.status(201).json({ message: "Tạo phiếu thành công", ticketId });
  } catch (err) {
    console.error("Lỗi tạo phiếu:", err);
    res.status(500).json({ error: "Lỗi tạo phiếu" });
  }
};


// Lấy danh sách phiếu
exports.getTickets = async (req, res) => {
  try {
    const tickets = await Inventory.getTickets();
    res.json(tickets);
  } catch (err) {
    console.error("Lỗi lấy danh sách phiếu:", err);
    res.status(500).json({ error: "Lỗi lấy danh sách phiếu" });
  }
};

// Lấy chi tiết phiếu theo ID
exports.getTicketDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Inventory.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ error: "Không tìm thấy phiếu" });
    }

    const items = await Inventory.getTicketDetails(id);

    return res.json({ ticket, items });
  } catch (err) {
    console.error("Lỗi lấy chi tiết phiếu:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Lỗi lấy chi tiết phiếu" });
    }
  }
};

