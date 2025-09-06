// resources/js/Pages/Transaksi/Edit.jsx
import React from "react";
import { usePage } from "@inertiajs/react";
import Create from "./Create";
import SidebarLayout from "@/Components/SidebarLayout";

export default function Edit() {
  const { props } = usePage();
  // Controller mengirim { prefill: {...} }
  return <Create mode="edit" prefill={props.prefill} />;
}

// pasang layout
Edit.layout = (page) => <SidebarLayout title="Edit Transaksi">{page}</SidebarLayout>;
