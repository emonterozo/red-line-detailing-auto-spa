import Transaction from "@/app/components/Transaction"
import { Suspense } from "react"
import FullScreenLoader from "@/app/components/FullScreenLoader";




export default function AdminTransactionPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Transaction />
    </Suspense>
  )
}

