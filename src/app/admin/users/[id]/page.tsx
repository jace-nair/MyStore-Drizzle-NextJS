import { requireAdmin } from "@/lib/auth-guard";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";
import UpdateUserForm from "./update-user-form";

export const metadata: Metadata = {
  title: "Update User",
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const AdminUserUpdatePage = async (props: Props) => {
  // protects admin page from non-admin users
  await requireAdmin();

  // Get the id by destructing it from the params
  const { id } = await props.params;

  // Get user from database by passing in the id from the params
  const dbUser = await getUserById(id);

  // Check if there is user
  if (!dbUser) {
    notFound();
  }

  // TEST
  //console.log(dbUser);

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <h1 className="h2-bold">Update User</h1>
      <UpdateUserForm user={dbUser} />
    </div>
  );
};

export default AdminUserUpdatePage;
