import { requireAdmin } from "@/lib/auth-guard";

const AdminProductUpdatePage = async () => {
  // protects admin page from non-admin users
  await requireAdmin();

  return <>AdminProductUpdatePage</>;
};

export default AdminProductUpdatePage;
