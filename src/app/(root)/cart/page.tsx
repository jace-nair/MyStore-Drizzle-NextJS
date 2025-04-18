import CartTable from "./cart-table";
import { getMyCart } from "@/lib/actions/cart.actions";

export const metadata = {
  title: "Shopping Cart",
};

const CartPage = async () => {
  const getCart = await getMyCart();

  return (
    <>
      <CartTable getCart={getCart} />
    </>
  );
};

export default CartPage;
