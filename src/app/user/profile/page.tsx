import { Metadata } from "next";
import { auth } from "@/auth";

// SessionProvider is needed because the form that is embedded in the profile page is going to be a client component. In a client component a session cannot be directly accessed like the server component. Instead use a useSession() hook. And useSession() needs to be wrapped in the SessionProvider.
import { SessionProvider } from "next-auth/react";
import ProfileForm from "./profile-form";

export const metadata: Metadata = {
  title: "Customer Profile",
};

const ProfilePage = async () => {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="h2-bold">Profile</h2>
        {/*TEST */}
        {/*session?.user?.name*/}
        <ProfileForm />
      </div>
    </SessionProvider>
  );
};

export default ProfilePage;
