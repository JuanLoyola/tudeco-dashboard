export interface LowStockItem {
  id: number;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
}

export interface CategoryStock {
  categoryId: number;
  name: string;
  products: number;
  units: number;
}

export interface DashboardSummary {
  totalProducts: number;
  activeProducts: number;
  stockUnits: number;
  stockValue: number;
  lowStockCount: number;
  lowStock: LowStockItem[];
  movementsLast7Days: number;
  stockByCategory: CategoryStock[];
}
