'use client';

import { useActionState } from "react";
import { deleteInvoice } from "@/app/lib/action";
import { TrashIcon } from "@heroicons/react/24/outline";

export function DeleteInvoice({ id }: { id: string }) {
    const deleteInvoiceWithId = deleteInvoice.bind(null, id);
    const [_state, formAction] = useActionState(deleteInvoiceWithId, undefined)
  
    return (
      <form action={formAction}>
        <button className="rounded-md border p-2 hover:bg-gray-100">
          <span className="sr-only">Delete</span>
          <TrashIcon className="w-5" />
        </button>
      </form>
    );
  }
  