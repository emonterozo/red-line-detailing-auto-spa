import CustomerProfile from "@/app/components/CustomerProfile";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CustomerProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <CustomerProfile customerId={session.user.id as string} />;
}
