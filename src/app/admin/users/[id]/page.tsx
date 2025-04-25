import { requireAdmin } from "@/lib/auth-guard";

const AdminUserUpdatePage = async () => {
  // protects admin page from non-admin users
  await requireAdmin();

  return <>AdminUserUpdatePage</>;
};

export default AdminUserUpdatePage;
