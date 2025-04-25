import { requireAdmin } from "@/lib/auth-guard";

const AdminUserPage = async () => {
  // protects admin page from non-admin users
  await requireAdmin();

  return <>AdminUserPage</>;
};

export default AdminUserPage;
