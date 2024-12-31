'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

const REVALIDATE_ROUTE = '/dashboard/invoices'
const REDIRECT_ROUTE = '/dashboard/invoices'

const formSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer'
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], { 
        invalid_type_error: 'Please select an invoice status',
    }),
    date: z.string(),
});

const CreateInvoice = formSchema.omit({ id: true, date: true });
const UpdateInvoice = formSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        ...Object.fromEntries(formData.entries())
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Faile to Create Invoice',
        }
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCoins = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    
    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCoins}, ${status}, ${date})
        `;
        
    } catch(error) {
        return {
            error,
            message: 'Database Error: Failed to Create Invoice.'
        };
    }
    
    revalidatePath(REVALIDATE_ROUTE);
    redirect(REDIRECT_ROUTE);
}

export async function updateInvoice(id: string, prevSate: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({ 
        ...Object.fromEntries(formData),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice',
        }
    }

    const { customerId, amount, status } = validatedFields.data;
    
    const amountInCents = amount * 100;
   
    try {                
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status ${status}
            WHERE id = ${id}
        `;    
        
    } catch (error) {
        return {
            error,
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
            error,
            message: 'Database Error: Failed to Delete Invoice.'
        };
    }
}

export async function autheticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData);

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type.toString()) {
                case 'CredentialsSignIn':
                    return 'Invalid credentials.';
            
                default:
                    return 'Something went wrong';
            }
        }

        throw error;
    }
}