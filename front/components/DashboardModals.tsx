import ConfirmDialog from '@/components/ConfirmDialog';
import Modal from '@/components/Modal';
import MovementForm from '@/components/MovementForm';
import MovementsList from '@/components/MovementsList';
import ProductForm from '@/components/ProductForm';
import type { Category, CreateMovementInput, Product, UpdateProductInput } from '@/lib/types';

/** Qué diálogo está abierto (o `null`). */
export type ModalState =
  | { kind: 'movement'; productId?: number }
  | { kind: 'newProduct' }
  | { kind: 'editProduct'; product: Product }
  | { kind: 'history'; product: Product }
  | { kind: 'delete'; product: Product }
  | null;

interface DashboardModalsProps {
  modal: ModalState;
  products: Product[];
  categories: Category[];
  /** Se incrementa tras cada escritura para recargar historiales abiertos. */
  refreshToken: number;
  busy: boolean;
  onClose: () => void;
  onCreateProduct: (input: UpdateProductInput) => Promise<void>;
  onUpdateProduct: (product: Product, input: UpdateProductInput) => Promise<void>;
  onCreateMovement: (input: CreateMovementInput) => Promise<void>;
  onDeleteProduct: () => void;
}

/** Un solo lugar para todos los diálogos del dashboard. */
export default function DashboardModals({
  modal,
  products,
  categories,
  refreshToken,
  busy,
  onClose,
  onCreateProduct,
  onUpdateProduct,
  onCreateMovement,
  onDeleteProduct,
}: DashboardModalsProps) {
  if (!modal) return null;

  switch (modal.kind) {
    case 'movement':
      return (
        <Modal title="Registrar movimiento" open onClose={onClose}>
          {products.length === 0 ? (
            <p className="text-sm text-slate-400">Primero creá un producto.</p>
          ) : (
            <MovementForm
              products={products}
              initialProductId={modal.productId}
              onSubmit={onCreateMovement}
            />
          )}
        </Modal>
      );

    case 'newProduct':
      return (
        <Modal title="Nuevo producto" open onClose={onClose}>
          <ProductForm mode="create" categories={categories} onSubmit={onCreateProduct} />
        </Modal>
      );

    case 'editProduct':
      return (
        <Modal title={`Editar · ${modal.product.name}`} open onClose={onClose}>
          <ProductForm
            mode="edit"
            product={modal.product}
            categories={categories}
            onSubmit={(input) => onUpdateProduct(modal.product, input)}
          />
        </Modal>
      );

    case 'history':
      return (
        <Modal title={`Historial · ${modal.product.name}`} open onClose={onClose}>
          <MovementsList productId={modal.product.id} refreshToken={refreshToken} />
        </Modal>
      );

    case 'delete':
      return (
        <Modal title="Eliminar producto" open onClose={onClose}>
          <ConfirmDialog
            title="Eliminar producto"
            message={`Vas a eliminar "${modal.product.name}" (${modal.product.sku}). No se puede deshacer.`}
            confirmLabel="Eliminar"
            busy={busy}
            onConfirm={onDeleteProduct}
            onCancel={onClose}
          />
        </Modal>
      );

    default:
      return null;
  }
}
