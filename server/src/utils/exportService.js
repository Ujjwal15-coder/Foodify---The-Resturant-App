/**
 * Export Service — PDF and Excel generation
 */
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// Generate PDF report
const generatePDFReport = async (data, type = 'orders') => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(24).fillColor('#FF6B35').text('FOODIFY', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#333').text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, { align: 'center' });
    doc.fontSize(10).fillColor('#888').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ddd');
    doc.moveDown(1);

    if (type === 'orders' && Array.isArray(data)) {
      // Summary
      const totalRevenue = data.reduce((sum, o) => sum + (o.total || 0), 0);
      doc.fontSize(12).fillColor('#333');
      doc.text(`Total Orders: ${data.length}`);
      doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
      doc.moveDown(1);

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10).fillColor('#FF6B35');
      doc.text('Order #', 50, tableTop, { width: 100 });
      doc.text('Customer', 150, tableTop, { width: 120 });
      doc.text('Amount', 280, tableTop, { width: 80 });
      doc.text('Status', 370, tableTop, { width: 80 });
      doc.text('Date', 460, tableTop, { width: 90 });
      doc.moveDown(0.5);

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#eee');
      doc.moveDown(0.3);

      // Table rows
      doc.fillColor('#333');
      data.slice(0, 50).forEach((order) => {
        if (doc.y > 700) {
          doc.addPage();
        }
        const y = doc.y;
        doc.fontSize(9);
        doc.text(order.orderNumber || '-', 50, y, { width: 100 });
        doc.text(order.user?.name || '-', 150, y, { width: 120 });
        doc.text(`₹${(order.total || 0).toFixed(2)}`, 280, y, { width: 80 });
        doc.text(order.status || '-', 370, y, { width: 80 });
        doc.text(order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-', 460, y, { width: 90 });
        doc.moveDown(0.5);
      });
    } else if (type === 'users' && Array.isArray(data)) {
      doc.fontSize(12).text(`Total Users: ${data.length}`);
      doc.moveDown(1);

      data.slice(0, 50).forEach((user) => {
        if (doc.y > 700) doc.addPage();
        doc.fontSize(10).text(`${user.name} — ${user.email} — Role: ${user.role}`, { indent: 10 });
        doc.moveDown(0.3);
      });
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#aaa').text('© FOODIFY — Confidential Report', { align: 'center' });

    doc.end();
  });
};

// Generate Excel report
const generateExcelReport = async (data, type = 'orders') => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FOODIFY';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(type.charAt(0).toUpperCase() + type.slice(1));

  // Style header
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B35' } };
  const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

  if (type === 'orders') {
    sheet.columns = [
      { header: 'Order #', key: 'orderNumber', width: 18 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Restaurant', key: 'restaurant', width: 20 },
      { header: 'Items', key: 'items', width: 12 },
      { header: 'Subtotal', key: 'subtotal', width: 12 },
      { header: 'Delivery Fee', key: 'deliveryFee', width: 14 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Payment', key: 'paymentMethod', width: 14 },
      { header: 'Date', key: 'date', width: 16 },
    ];

    data.forEach((order) => {
      sheet.addRow({
        orderNumber: order.orderNumber,
        customer: order.user?.name || '-',
        restaurant: order.restaurant?.name || '-',
        items: order.items?.length || 0,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-',
      });
    });
  } else if (type === 'users') {
    sheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Role', key: 'role', width: 18 },
      { header: 'Total Orders', key: 'totalOrders', width: 14 },
      { header: 'Wallet Balance', key: 'walletBalance', width: 14 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Joined', key: 'joined', width: 16 },
    ];

    data.forEach((user) => {
      sheet.addRow({
        name: user.name,
        email: user.email,
        phone: user.phone || '-',
        role: user.role,
        totalOrders: user.totalOrders,
        walletBalance: user.walletBalance,
        status: user.isActive ? 'Active' : 'Inactive',
        joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-',
      });
    });
  }

  // Style header row
  sheet.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: 'center' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = { generatePDFReport, generateExcelReport };
