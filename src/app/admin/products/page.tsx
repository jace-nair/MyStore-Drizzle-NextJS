import { requireAdmin } from "@/lib/auth-guard";

const AdminProductsPage = async () => {
  // protects admin page from non-admin users
  await requireAdmin();

  return <>AdminProductsPage</>;
};

export default AdminProductsPage;
