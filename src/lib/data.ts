import { Buyer, Supplier, CRMLead, RFQ, Quotation, Sample, Order, Shipment, Document } from "@/types";

export const buyers: Buyer[] = [
  { id: "1", buyerId: "BUY-001", companyName: "Nordic Trade AS", country: "Norway", contactPerson: "Lars Eriksen", email: "lars@nordictrade.no", phone: "+47 9123 4567", website: "nordictrade.no", linkedin: "linkedin.com/in/larseriksen", category: "Textiles", status: "Active", notes: "Prefers quarterly orders", createdAt: "2024-01-15" },
  { id: "2", buyerId: "BUY-002", companyName: "Delta Imports GmbH", country: "Germany", contactPerson: "Klaus Müller", email: "k.muller@deltaimports.de", phone: "+49 30 4567890", website: "deltaimports.de", category: "Electronics", status: "Active", notes: "High volume buyer", createdAt: "2024-02-01" },
  { id: "3", buyerId: "BUY-003", companyName: "Sunrise Trading LLC", country: "USA", contactPerson: "Michael Chen", email: "m.chen@sunrisetrading.com", phone: "+1 415 555 0123", website: "sunrisetrading.com", category: "Furniture", status: "Active", createdAt: "2024-02-10" },
  { id: "4", buyerId: "BUY-004", companyName: "Gulf Mart FZCO", country: "UAE", contactPerson: "Ahmed Al-Rashid", email: "ahmed@gulfmart.ae", phone: "+971 50 123 4567", category: "Home Goods", status: "Active", createdAt: "2024-03-05" },
  { id: "5", buyerId: "BUY-005", companyName: "Kangaroo Distributors", country: "Australia", contactPerson: "Sarah Williams", email: "sarah@kangaroodist.com.au", phone: "+61 2 9876 5432", category: "Sportswear", status: "Prospect", createdAt: "2024-03-20" },
  { id: "6", buyerId: "BUY-006", companyName: "Maple Leaf Imports", country: "Canada", contactPerson: "David Tremblay", email: "d.tremblay@mapleleaf.ca", phone: "+1 514 555 0187", category: "Textiles", status: "Active", createdAt: "2024-04-01" },
  { id: "7", buyerId: "BUY-007", companyName: "Sakura Trading Co.", country: "Japan", contactPerson: "Yuki Tanaka", email: "tanaka@sakuratrade.jp", phone: "+81 3 1234 5678", category: "Electronics", status: "Active", createdAt: "2024-04-15" },
  { id: "8", buyerId: "BUY-008", companyName: "Iberia Mercados", country: "Spain", contactPerson: "Carlos Fernandez", email: "c.fernandez@iberia.es", phone: "+34 91 234 5678", category: "Ceramics", status: "Inactive", createdAt: "2024-01-08" },
];

export const suppliers: Supplier[] = [
  { id: "1", supplierId: "SUP-001", companyName: "Zhongshan Textile Mill", location: "Guangdong, China", contactPerson: "Wang Lei", email: "wanglei@zstextile.com", phone: "+86 760 8888 1234", moq: "500 pcs", leadTime: "30 days", categories: ["Textiles", "Garments"], reliabilityScore: 92, createdAt: "2023-06-01" },
  { id: "2", supplierId: "SUP-002", companyName: "Shenzhen Electronics Hub", location: "Shenzhen, China", contactPerson: "Li Mei", email: "limei@szhub.com", phone: "+86 755 2345 6789", moq: "100 units", leadTime: "21 days", categories: ["Electronics", "Gadgets"], reliabilityScore: 88, createdAt: "2023-07-15" },
  { id: "3", supplierId: "SUP-003", companyName: "Vietnam Furniture Co.", location: "Ho Chi Minh City, Vietnam", contactPerson: "Nguyen Van An", email: "vanan@vnfurniture.vn", phone: "+84 28 3456 7890", moq: "50 sets", leadTime: "45 days", categories: ["Furniture", "Home Decor"], reliabilityScore: 85, createdAt: "2023-08-20" },
  { id: "4", supplierId: "SUP-004", companyName: "Istanbul Ceramics Ltd", location: "Istanbul, Turkey", contactPerson: "Mehmet Yilmaz", email: "m.yilmaz@istceramics.com", phone: "+90 212 345 6789", moq: "200 pcs", leadTime: "35 days", categories: ["Ceramics", "Glassware"], reliabilityScore: 90, createdAt: "2023-09-10" },
  { id: "5", supplierId: "SUP-005", companyName: "Mumbai Sportswear Pvt", location: "Mumbai, India", contactPerson: "Rajesh Sharma", email: "rajesh@mmbsports.in", phone: "+91 22 2345 6789", moq: "300 pcs", leadTime: "25 days", categories: ["Sportswear", "Activewear"], reliabilityScore: 87, createdAt: "2023-10-01" },
  { id: "6", supplierId: "SUP-006", companyName: "BD Leather Crafts", location: "Dhaka, Bangladesh", contactPerson: "Rahim Hossain", email: "rahim@bdleather.com.bd", phone: "+880 2 9876 5432", moq: "200 pcs", leadTime: "40 days", categories: ["Leather Goods", "Accessories"], reliabilityScore: 83, createdAt: "2023-11-05" },
];

export const crmLeads: CRMLead[] = [
  { id: "1", buyerName: "Nordic Trade AS", country: "Norway", category: "Textiles", stage: "Repeat Customer", value: 85000, assignedTo: "Priya Mehta", updatedAt: "2025-01-10" },
  { id: "2", buyerName: "Pacific Rim Corp", country: "USA", category: "Electronics", stage: "Negotiation", value: 120000, assignedTo: "Ali Hassan", updatedAt: "2025-01-12" },
  { id: "3", buyerName: "Euro Lifestyle GmbH", country: "Germany", category: "Home Goods", stage: "Quotation Sent", value: 45000, assignedTo: "Priya Mehta", updatedAt: "2025-01-08" },
  { id: "4", buyerName: "Kiwi Imports NZ", country: "New Zealand", category: "Furniture", stage: "Meeting Scheduled", value: 30000, assignedTo: "Ravi Kumar", updatedAt: "2025-01-11" },
  { id: "5", buyerName: "Amazon Traders BR", country: "Brazil", category: "Textiles", stage: "RFQ Received", value: 60000, assignedTo: "Ali Hassan", updatedAt: "2025-01-09" },
  { id: "6", buyerName: "Sahara Trading Co", country: "Egypt", category: "Garments", stage: "Contacted", value: 25000, assignedTo: "Priya Mehta", updatedAt: "2025-01-07" },
  { id: "7", buyerName: "Seoul Style Inc", country: "South Korea", category: "Sportswear", stage: "Replied", value: 40000, assignedTo: "Ravi Kumar", updatedAt: "2025-01-06" },
  { id: "8", buyerName: "Lagos Commerce Ltd", country: "Nigeria", category: "Electronics", stage: "Lead Identified", assignedTo: "Ali Hassan", updatedAt: "2025-01-13" },
  { id: "9", buyerName: "Fjord Imports AB", country: "Sweden", category: "Ceramics", stage: "Researching", value: 20000, assignedTo: "Priya Mehta", updatedAt: "2025-01-05" },
  { id: "10", buyerName: "Alpine Goods AG", country: "Switzerland", category: "Leather Goods", stage: "Won", value: 95000, assignedTo: "Ravi Kumar", updatedAt: "2024-12-20" },
  { id: "11", buyerName: "Acropolis Trade", country: "Greece", category: "Textiles", stage: "Lost", value: 15000, assignedTo: "Ali Hassan", updatedAt: "2024-12-15" },
];

export const rfqs: RFQ[] = [
  { id: "1", rfqNumber: "RFQ-2025-001", buyer: "Nordic Trade AS", product: "Cotton T-Shirts", quantity: 5000, unit: "pcs", specifications: "100% cotton, sizes S-XXL, custom branding", deadline: "2025-02-15", status: "Open", assignedTo: "Priya Mehta", createdAt: "2025-01-10" },
  { id: "2", rfqNumber: "RFQ-2025-002", buyer: "Delta Imports GmbH", product: "Bluetooth Earphones", quantity: 1000, unit: "units", specifications: "TWS, ANC, 24hr battery", deadline: "2025-02-10", status: "In Progress", assignedTo: "Ali Hassan", createdAt: "2025-01-08" },
  { id: "3", rfqNumber: "RFQ-2025-003", buyer: "Sunrise Trading LLC", product: "Teak Dining Table", quantity: 100, unit: "sets", specifications: "6-seater, natural finish, flat-pack", deadline: "2025-03-01", status: "Open", assignedTo: "Ravi Kumar", createdAt: "2025-01-12" },
  { id: "4", rfqNumber: "RFQ-2025-004", buyer: "Gulf Mart FZCO", product: "Ceramic Dinner Set", quantity: 2000, unit: "sets", specifications: "12-piece, food safe glaze, microwave safe", deadline: "2025-02-20", status: "Closed", assignedTo: "Priya Mehta", createdAt: "2024-12-20" },
  { id: "5", rfqNumber: "RFQ-2025-005", buyer: "Maple Leaf Imports", product: "Yoga Pants", quantity: 3000, unit: "pcs", specifications: "4-way stretch, sizes XS-XL", deadline: "2025-02-28", status: "In Progress", assignedTo: "Ali Hassan", createdAt: "2025-01-05" },
];

export const quotations: Quotation[] = [
  { id: "1", quotationNumber: "QUO-2025-001", buyer: "Nordic Trade AS", supplier: "Zhongshan Textile Mill", product: "Cotton T-Shirts", quantity: 5000, unit: "pcs", costPrice: 3.20, sellingPrice: 4.80, margin: 1.60, marginPct: 33.3, status: "Accepted", rfqId: "1", createdAt: "2025-01-12" },
  { id: "2", quotationNumber: "QUO-2025-002", buyer: "Delta Imports GmbH", supplier: "Shenzhen Electronics Hub", product: "Bluetooth Earphones", quantity: 1000, unit: "units", costPrice: 12.50, sellingPrice: 19.00, margin: 6.50, marginPct: 34.2, status: "Sent", rfqId: "2", createdAt: "2025-01-10" },
  { id: "3", quotationNumber: "QUO-2025-003", buyer: "Sunrise Trading LLC", supplier: "Vietnam Furniture Co.", product: "Teak Dining Table", quantity: 100, unit: "sets", costPrice: 280.00, sellingPrice: 420.00, margin: 140.00, marginPct: 33.3, status: "Draft", rfqId: "3", createdAt: "2025-01-13" },
  { id: "4", quotationNumber: "QUO-2025-004", buyer: "Gulf Mart FZCO", supplier: "Istanbul Ceramics Ltd", product: "Ceramic Dinner Set", quantity: 2000, unit: "sets", costPrice: 18.00, sellingPrice: 28.50, margin: 10.50, marginPct: 36.8, status: "Accepted", rfqId: "4", createdAt: "2024-12-22" },
  { id: "5", quotationNumber: "QUO-2025-005", buyer: "Maple Leaf Imports", supplier: "Mumbai Sportswear Pvt", product: "Yoga Pants", quantity: 3000, unit: "pcs", costPrice: 5.80, sellingPrice: 9.20, margin: 3.40, marginPct: 36.9, status: "Sent", rfqId: "5", createdAt: "2025-01-07" },
  { id: "6", quotationNumber: "QUO-2024-012", buyer: "Alpine Goods AG", supplier: "BD Leather Crafts", product: "Leather Wallets", quantity: 1500, unit: "pcs", costPrice: 8.50, sellingPrice: 14.00, margin: 5.50, marginPct: 39.3, status: "Accepted", createdAt: "2024-11-15" },
];

export const samples: Sample[] = [
  { id: "1", sampleId: "SMP-001", buyer: "Nordic Trade AS", supplier: "Zhongshan Textile Mill", product: "Cotton T-Shirts", courier: "DHL", trackingNumber: "1234567890", status: "Approved", createdAt: "2024-12-10" },
  { id: "2", sampleId: "SMP-002", buyer: "Delta Imports GmbH", supplier: "Shenzhen Electronics Hub", product: "Bluetooth Earphones", courier: "FedEx", trackingNumber: "9876543210", status: "Delivered", createdAt: "2025-01-05" },
  { id: "3", sampleId: "SMP-003", buyer: "Sunrise Trading LLC", supplier: "Vietnam Furniture Co.", product: "Dining Chair", courier: "UPS", trackingNumber: "5678901234", status: "Sent", createdAt: "2025-01-11" },
  { id: "4", sampleId: "SMP-004", buyer: "Gulf Mart FZCO", supplier: "Istanbul Ceramics Ltd", product: "Ceramic Vase", status: "Requested", createdAt: "2025-01-13" },
  { id: "5", sampleId: "SMP-005", buyer: "Maple Leaf Imports", supplier: "Mumbai Sportswear Pvt", product: "Yoga Pants", courier: "DHL", trackingNumber: "1122334455", status: "Sent", createdAt: "2025-01-09" },
];

export const orders: Order[] = [
  { id: "1", orderNumber: "ORD-2025-001", client: "Nordic Trade AS", supplier: "Zhongshan Textile Mill", product: "Cotton T-Shirts", quantity: 5000, unit: "pcs", orderValue: 24000, currency: "USD", status: "Production", createdAt: "2025-01-14" },
  { id: "2", orderNumber: "ORD-2024-048", client: "Gulf Mart FZCO", supplier: "Istanbul Ceramics Ltd", product: "Ceramic Dinner Set", quantity: 2000, unit: "sets", orderValue: 57000, currency: "USD", status: "Dispatched", createdAt: "2024-12-28" },
  { id: "3", orderNumber: "ORD-2024-042", client: "Alpine Goods AG", supplier: "BD Leather Crafts", product: "Leather Wallets", quantity: 1500, unit: "pcs", orderValue: 21000, currency: "USD", status: "Delivered", createdAt: "2024-11-20" },
  { id: "4", orderNumber: "ORD-2024-039", client: "Sakura Trading Co.", supplier: "Shenzhen Electronics Hub", product: "Bluetooth Speakers", quantity: 500, unit: "units", orderValue: 18500, currency: "USD", status: "Delivered", createdAt: "2024-11-01" },
  { id: "5", orderNumber: "ORD-2025-002", client: "Maple Leaf Imports", supplier: "Mumbai Sportswear Pvt", product: "Yoga Pants", quantity: 3000, unit: "pcs", orderValue: 27600, currency: "USD", status: "Confirmed", createdAt: "2025-01-13" },
];

export const shipments: Shipment[] = [
  { id: "1", shipmentNumber: "SHP-2025-001", orderNumber: "ORD-2025-001", freightType: "Sea", forwarder: "Maersk Line", trackingNumber: "MSCU1234567", etd: "2025-02-10", eta: "2025-03-05", status: "Booked", origin: "Guangzhou, China", destination: "Oslo, Norway" },
  { id: "2", shipmentNumber: "SHP-2024-048", orderNumber: "ORD-2024-048", freightType: "Sea", forwarder: "MSC Mediterranean", trackingNumber: "MSCD9876543", etd: "2025-01-05", eta: "2025-01-22", status: "In Transit", origin: "Istanbul, Turkey", destination: "Dubai, UAE" },
  { id: "3", shipmentNumber: "SHP-2024-042", orderNumber: "ORD-2024-042", freightType: "Air", forwarder: "Qatar Airways Cargo", trackingNumber: "QR12345678", etd: "2024-12-01", eta: "2024-12-03", status: "Delivered", origin: "Dhaka, Bangladesh", destination: "Zurich, Switzerland" },
  { id: "4", shipmentNumber: "SHP-2025-002", orderNumber: "ORD-2025-002", freightType: "Sea", forwarder: "Evergreen Marine", trackingNumber: "EGLV1122334", etd: "2025-02-05", eta: "2025-03-01", status: "Booked", origin: "Mumbai, India", destination: "Toronto, Canada" },
];

export const documents: Document[] = [
  { id: "1", name: "Invoice ORD-2025-001.pdf", type: "Invoice", relatedTo: "ORD-2025-001", uploadedBy: "Anjali Singh", uploadedAt: "2025-01-14", size: "245 KB" },
  { id: "2", name: "Packing List ORD-2024-048.pdf", type: "Packing List", relatedTo: "ORD-2024-048", uploadedBy: "Ravi Kumar", uploadedAt: "2025-01-02", size: "189 KB" },
  { id: "3", name: "BL SHP-2024-048.pdf", type: "Shipping Bill", relatedTo: "SHP-2024-048", uploadedBy: "Anjali Singh", uploadedAt: "2025-01-05", size: "312 KB" },
  { id: "4", name: "Quality Cert SUP-001.pdf", type: "Certificate", relatedTo: "SUP-001", uploadedBy: "Priya Mehta", uploadedAt: "2024-12-15", size: "156 KB" },
  { id: "5", name: "Contract Nordic 2025.pdf", type: "Contract", relatedTo: "BUY-001", uploadedBy: "CEO", uploadedAt: "2025-01-01", size: "520 KB" },
  { id: "6", name: "Invoice ORD-2024-042.pdf", type: "Invoice", relatedTo: "ORD-2024-042", uploadedBy: "Anjali Singh", uploadedAt: "2024-11-21", size: "198 KB" },
];

export const revenueByMonth = [
  { month: "Aug", revenue: 82000, orders: 18 },
  { month: "Sep", revenue: 95000, orders: 22 },
  { month: "Oct", revenue: 78000, orders: 17 },
  { month: "Nov", revenue: 112000, orders: 28 },
  { month: "Dec", revenue: 135000, orders: 32 },
  { month: "Jan", revenue: 148000, orders: 35 },
];

export const revenueByCountry = [
  { country: "Norway", revenue: 85000 },
  { country: "Germany", revenue: 62000 },
  { country: "UAE", revenue: 57000 },
  { country: "Switzerland", revenue: 42000 },
  { country: "Japan", revenue: 38000 },
  { country: "Canada", revenue: 27600 },
  { country: "Others", revenue: 25000 },
];

export const revenueByCategory = [
  { category: "Textiles", revenue: 112000 },
  { category: "Electronics", revenue: 88000 },
  { category: "Furniture", revenue: 65000 },
  { category: "Ceramics", revenue: 57000 },
  { category: "Leather", revenue: 42000 },
  { category: "Sportswear", revenue: 31000 },
];

export const financeData = {
  totalRevenue: 650000,
  totalExpenses: 460000,
  totalProfit: 190000,
  pendingReceivables: 85000,
  pendingPayables: 42000,
  monthlyData: revenueByMonth,
};

export const supplierComparison = [
  { supplier: "Zhongshan Textile Mill", price: 3.20, moq: "500 pcs", leadTime: "30 days", reliabilityScore: 92, rating: 4.6 },
  { supplier: "Mumbai Sportswear Pvt", price: 3.50, moq: "300 pcs", leadTime: "25 days", reliabilityScore: 87, rating: 4.3 },
  { supplier: "BD Leather Crafts", price: 2.90, moq: "200 pcs", leadTime: "40 days", reliabilityScore: 83, rating: 4.1 },
];
