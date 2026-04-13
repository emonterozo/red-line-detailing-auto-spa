import CustomerBooking from "@/app/components/CustomerBooking";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CustomerBookingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <CustomerBooking />
}
