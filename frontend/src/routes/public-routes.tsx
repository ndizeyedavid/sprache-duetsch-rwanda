import { Navigate,Route } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { ForgotPassword } from "../pages/auth/ForgotPassword";
import { DemoAccounts } from "../pages/auth/DemoAccounts";
import { LoginForm } from "../pages/auth/LoginForm";
import { Register } from "../pages/auth/Register";
import { ResetPassword } from "../pages/auth/ResetPassword";
import { PublicInvoice } from "../pages/PublicInvoice";
import { VerifyCertificate } from "../pages/VerifyCertificate";
import { VerifyReceipt } from "../pages/VerifyReceipt";
import { PublicApply } from "./public-pages";

/** Pages that need no sign-in. Rendered inside <Routes> as a fragment. */
export function publicRoutes() {
  return (
    <>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/login/teacher" element={<Navigate to="/login" replace />} />
        <Route path="/login/staff" element={<Navigate to="/login" replace />} />
        <Route path="/demo" element={<DemoAccounts />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/apply" element={<PublicApply />} />
      </Route>
      <Route path="/verify/receipt/:id" element={<VerifyReceipt />} />
      <Route path="/invoice/:token" element={<PublicInvoice />} />
      <Route path="/verify/:code" element={<VerifyCertificate />} />
      <Route path="/catalog" element={<Navigate to="/login" replace />} />
    </>
  );
}
