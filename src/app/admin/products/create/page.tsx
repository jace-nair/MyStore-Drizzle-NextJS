import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import ProductForm from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Create Product",
};

const CreateProductPage = async () => {
  // protects admin page from non-admin users
  await requireAdmin();

  return (
    <>
      <h2 className="h2-bold">Create Product</h2>
      <div className="my-8">
        {/* ProductForm takes in a type because the same form can be used to "Create" or "Update" a product.*/}
        <ProductForm type="Create" />
      </div>
    </>
  );
};

export default CreateProductPage;
