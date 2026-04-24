import { auth } from "@/auth";
import Login from "../components/Login";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/customer/me");
  }

  return <Login />;
}
