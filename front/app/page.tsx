'use client';

import { useCallback, useEffect, useState } from 'react';
import Banner from '@/components/Banner';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardModals, { type ModalState } from '@/components/DashboardModals';
import InsightPanels from '@/components/InsightPanels';
import ProductsTable from '@/components/ProductsTable';
import SummaryCards from '@/components/SummaryCards';
import {
  createMovement,
  deleteProduct,
  getCategories,
  getDashboardSummary,
  getProducts,
  updateProduct,
} from '@/lib/api';
import { errorMessage } from '@/lib/format';
import { createProductWithInitialStock } from '@/lib/stock';
import type {
  Category,
  CreateMovementInput,
  DashboardSummary,
  Product,
  UpdateProductInput,
} from '@/lib/types';

/**
 * Página que orquesta el dashboard: carga los datos, guarda los callbacks de
 * escritura y decide qué diálogo está abierto. El render vive en componentes.
 */
export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [busy, setBusy] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const [nextCategories, nextSummary, productList] = await Promise.all([
        getCategories(),
        getDashboardSummary(),
        getProducts(),
      ]);
      setCategories(nextCategories);
      setSummary(nextSummary);
      setProducts(productList.data);
    } catch (cause) {
      setLoadError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  /** Recarga sin mostrar el skeleton: se usa después de cada escritura. */
  const refresh = useCallback(async () => {
    const [nextSummary, productList] = await Promise.all([getDashboardSummary(), getProducts()]);
    setSummary(nextSummary);
    setProducts(productList.data);
    setRefreshToken((token) => token + 1);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const closeModal = () => setModal(null);

  const openModal = (next: ModalState) => {
    setActionError(null);
    setModal(next);
  };

  const handleCreateProduct = async (input: UpdateProductInput) => {
    // el producto nace con stock 0 y el movimiento explica las unidades iniciales
    await createProductWithInitialStock(input);
    await refresh();
    closeModal();
  };

  const handleUpdateProduct = async (product: Product, input: UpdateProductInput) => {
    await updateProduct(product.id, input);
    await refresh();
    closeModal();
  };

  const handleCreateMovement = async (input: CreateMovementInput) => {
    await createMovement(input);
    await refresh();
    closeModal();
  };

  const handleDelete = async () => {
    if (modal?.kind !== 'delete') return;

    setBusy(true);
    setActionError(null);

    try {
      await deleteProduct(modal.product.id);
      await refresh();
      closeModal();
    } catch (cause) {
      // típico: 422 si el producto ya tiene historial de stock. Cerramos el
      // diálogo para que el aviso no quede tapado por el overlay.
      setActionError(errorMessage(cause));
      closeModal();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      {/* La "ventana" de vidrio: todo el dashboard vive dentro. */}
      <div className="glass anim-rise relative overflow-hidden rounded-[28px] p-5 sm:p-7 lg:p-9">
        {/* Brillo interno del vidrio: color propio aunque cambie el fondo. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(65%_55%_at_88%_0%,rgb(16_185_129/0.18),transparent_70%),radial-gradient(55%_45%_at_5%_100%,rgb(56_189_248/0.16),transparent_70%)]"
        />

        <DashboardHeader
          loading={loading}
          canRegisterMovement={products.length > 0}
          onRegisterMovement={() => openModal({ kind: 'movement' })}
          onNewProduct={() => openModal({ kind: 'newProduct' })}
          onRefresh={() => void load()}
        />

        {loadError ? (
          <Banner tone="danger" className="mt-8">
            No pude leer la API: {loadError}
            <p className="mt-1 text-red-400/80">
              ¿Está corriendo el back en el puerto 4000? (
              <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-xs">npm run dev</code>)
            </p>
          </Banner>
        ) : null}

        {actionError ? <Banner className="mt-6">{actionError}</Banner> : null}

        {summary ? (
          <>
            <SummaryCards summary={summary} />
            <InsightPanels summary={summary} />

            <section className="anim-rise mt-8" style={{ animationDelay: '240ms' }}>
              <h2 className="text-[11px] font-medium tracking-[0.2em] text-slate-400 uppercase">
                Productos
              </h2>
              <div className="mt-4">
                <ProductsTable
                  products={products}
                  onEdit={(product) => setModal({ kind: 'editProduct', product })}
                  onDelete={(product) => openModal({ kind: 'delete', product })}
                  onHistory={(product) => setModal({ kind: 'history', product })}
                />
              </div>
            </section>
          </>
        ) : null}

        {!summary && !loadError && loading ? (
          <p className="mt-10 text-sm text-slate-500">Cargando métricas…</p>
        ) : null}
      </div>

      {/*
        Los modales quedan fuera del vidrio a propósito: un ancestor con
        backdrop-filter crea un containing block y el overlay `fixed`
        se recortaría a la ventana en vez de cubrir la pantalla.
      */}
      <DashboardModals
        modal={modal}
        products={products}
        categories={categories}
        refreshToken={refreshToken}
        busy={busy}
        onClose={closeModal}
        onCreateProduct={handleCreateProduct}
        onUpdateProduct={handleUpdateProduct}
        onCreateMovement={handleCreateMovement}
        onDeleteProduct={() => void handleDelete()}
      />
    </main>
  );
}
