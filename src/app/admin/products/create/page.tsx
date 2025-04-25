import { requireAdmin } from "@/lib/auth-guard";

const CreateProductPage = async () => {
  // protects admin page from non-admin users
  await requireAdmin();

  return <>CreateProductPage</>;
};

export default CreateProductPage;
