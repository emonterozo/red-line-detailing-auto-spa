import { auth } from "@/auth";
import Login from "../components/Login";
import { redirect } from "next/navigation";
import Rewards from "../components/Rewards";

export default async function LoginPage() {
  // const session = await auth();

  // if (session?.user) {
  //   redirect("/customer/me");
  // }

  return <Rewards />
}
