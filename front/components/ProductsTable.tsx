import Button from '@/components/Button';
import { money } from '@/lib/format';
import type { Product } from '@/lib/types';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onHistory: (product: Product) => void;
}

const headCell = 'px-4 py-3 text-[11px] font-medium tracking-[0.16em] uppercase';

/** Tabla de productos con stock crítico marcado y acciones por fila. */
export default function ProductsTable({
  products,
  onEdit,
  onDelete,
  onHistory,
}: ProductsTableProps) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No hay productos cargados.</p>;
  }

  return (
    <div className="glass-soft overflow-x-auto rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 text-slate-400">
          <tr>
            <th className={headCell}>SKU</th>
            <th className={headCell}>Producto</th>
            <th className={headCell}>Categoría</th>
            <th className={`${headCell} text-right`}>Precio</th>
            <th className={`${headCell} text-right`}>Stock</th>
            <th className={`${headCell} text-right`}>Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {products.map((product) => {
            const critical = product.stock <= product.minStock;

            return (
              <tr key={product.id} className="transition hover:bg-white/[0.04]">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{product.sku}</td>
                <td className="px-4 py-3">
                  {product.name}
                  {!product.isActive ? (
                    <span className="ml-2 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-slate-400">
                      inactivo
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-400">{product.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-right tabular-nums">{money(product.price)}</td>
                <td
                  className={`px-4 py-3 text-right tabular-nums ${
                    critical ? 'font-semibold text-amber-400' : 'text-slate-300'
                  }`}
                  data-critical={critical ? 'true' : 'false'}
                >
                  {critical ? `${product.stock} · mínimo ${product.minStock}` : product.stock}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="subtle" onClick={() => onHistory(product)}>
                      Historial
                    </Button>
                    <Button size="sm" variant="subtle" onClick={() => onEdit(product)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(product)}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
