import ProductForm from "@/components/admin/product-form";
import { getProductById } from "@/lib/actions/product.actions";
import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Update Product",
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const AdminProductUpdatePage = async (props: Props) => {
  // protects admin page from non-admin users
  await requireAdmin();

  const { id } = await props.params;

  //TEST
  //console.log(`product id is ${id}`);

  // Get the product from the database using the "id" from params
  const dbProduct = await getProductById(id);

  if (!dbProduct) {
    return notFound();
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update Product</h1>
      <ProductForm type="Update" product={dbProduct} productId={dbProduct.id} />
    </div>
  );
};

export default AdminProductUpdatePage;
