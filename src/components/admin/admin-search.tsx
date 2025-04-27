"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";

const AdminSearch = () => {
  // Get the pathname to ascertain where the component is being used in the admin section: products, order or users. As this client component, use usePathName() hook.
  const pathname = usePathname();

  // Create submit URL based on the pathname obtained from usePathname() hook. This is what the form will submit to.
  const formActionUrl = pathname.includes("/admin/orders")
    ? "/admin/orders"
    : pathname.includes("/admin/users")
    ? "/admin/users"
    : "/admin/products";

  // Now get the searchParams to get the query. As this is a client component, use useSearchParams() hook.
  const searchParams = useSearchParams();

  // Set the state and have the query in the state. For default value of queryValue get searchParams "query" value and if there's none set it as empty string.
  const [queryValue, setQueryValue] = useState(searchParams.get("query") || "");

  // We want to run the setQueryValue whenever the query changes so we are going to use useEffect() hook for that.
  useEffect(() => {
    setQueryValue(searchParams.get("query") || "");
  }, [searchParams]);

  return (
    <form action={formActionUrl} method="GET">
      <Input
        type="search"
        placeholder="Search..."
        name="query"
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        className="md:w-[100px] lg:w-[300px]"
      />
      {/* Button for screen readers only */}
      <button className="sr-only" type="submit">
        Search
      </button>
    </form>
  );
};

export default AdminSearch;
