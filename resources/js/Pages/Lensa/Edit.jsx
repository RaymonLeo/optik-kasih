import React from "react";
import { usePage } from "@inertiajs/react";
import Create from "./Create";

export default function Edit() {
  const { props } = usePage();
  return <Create mode="edit" prefill={props.prefill} />;
}
