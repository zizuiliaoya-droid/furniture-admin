import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Spin } from "antd";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const UserManagementPage = lazy(() => import("./pages/auth/UserManagementPage"));
const ProductListPage = lazy(() => import("./pages/products/ProductListPage"));
const ProductFormPage = lazy(() => import("./pages/products/ProductFormPage"));
const ProductDetailPage = lazy(() => import("./pages/products/ProductDetailPage"));
const CategoryManagementPage = lazy(() => import("./pages/products/CategoryManagementPage"));
const CatalogPage = lazy(() => import("./pages/catalog/CatalogPage"));
const CaseListPage = lazy(() => import("./pages/cases/CaseListPage"));
const CaseFormPage = lazy(() => import("./pages/cases/CaseFormPage"));
const CaseDetailPage = lazy(() => import("./pages/cases/CaseDetailPage"));
const DocumentListPage = lazy(() => import("./pages/documents/DocumentListPage"));
const QuoteListPage = lazy(() => import("./pages/quotes/QuoteListPage"));
const QuoteFormPage = lazy(() => import("./pages/quotes/QuoteFormPage"));
const QuoteDetailPage = lazy(() => import("./pages/quotes/QuoteDetailPage"));
const ShareManagementPage = lazy(() => import("./pages/sharing/ShareManagementPage"));
const ShareViewPage = lazy(() => import("./pages/sharing/ShareViewPage"));

function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Spin size="large" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/products" replace />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/new" element={<ProtectedRoute requireAdmin><ProductFormPage /></ProtectedRoute>} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="products/:id/edit" element={<ProtectedRoute requireAdmin><ProductFormPage /></ProtectedRoute>} />
            <Route path="categories" element={<ProtectedRoute requireAdmin><CategoryManagementPage /></ProtectedRoute>} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="cases" element={<CaseListPage />} />
            <Route path="cases/new" element={<ProtectedRoute requireAdmin><CaseFormPage /></ProtectedRoute>} />
            <Route path="cases/:id" element={<CaseDetailPage />} />
            <Route path="cases/:id/edit" element={<ProtectedRoute requireAdmin><CaseFormPage /></ProtectedRoute>} />
            <Route path="documents/design" element={<DocumentListPage />} />
            <Route path="documents/training" element={<DocumentListPage />} />
            <Route path="documents/certificates" element={<DocumentListPage />} />
            <Route path="quotes" element={<QuoteListPage />} />
            <Route path="quotes/new" element={<QuoteFormPage />} />
            <Route path="quotes/:id" element={<QuoteDetailPage />} />
            <Route path="quotes/:id/edit" element={<QuoteFormPage />} />
            <Route path="shares" element={<ShareManagementPage />} />
            <Route path="users" element={<ProtectedRoute requireAdmin><UserManagementPage /></ProtectedRoute>} />
          </Route>
          <Route path="/s/:token" element={<ShareViewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
