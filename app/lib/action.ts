'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const REVALIDATE_ROUTE = '/dashboard/invoices'
const REDIRECT_ROUTE = '/dashboard/invoices'

const formSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = formSchema.omit({ id: true, date: true });
const UpdateInvoice = formSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        ...Object.fromEntries(formData.entries())
    });
    
    const amountInCoins = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    
    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCoins}, ${status}, ${date})
        `;
        
    } catch(error) {
        return {
            message: 'Database Error: Failed to Create Invoice.'
        };
    }
    
    revalidatePath(REVALIDATE_ROUTE);
    redirect(REDIRECT_ROUTE);
}

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({ 
        ...Object.fromEntries(formData),
    });
    
    const amountInCents = amount * 100;
   
    try {                
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status ${status}
            WHERE id = ${id}
        `;    
        
    } catch (error) {
        return {
            message: 'Database Error: Failed to Update Invoice.'
        };
    }

    revalidatePath(REVALIDATE_ROUTE);
    redirect(REDIRECT_ROUTE);
}

export async function deleteInvoice(id: string) {
    try {

        await sql`DELETE FROM invoices WHERE id = ${id}`;

        revalidatePath(REVALIDATE_ROUTE);

        return {
            message: 'Delete Invoice.'
        };

    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Invoice.'
        };
    }
}