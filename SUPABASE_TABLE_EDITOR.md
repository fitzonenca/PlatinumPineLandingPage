# Supabase Table - Table Editor se banao (SQL ki jagah)

Agar SQL Editor mein query run nahi ho rahi, **Table Editor** se manually table banao:

## Steps

1. Supabase Dashboard → **Table Editor** (left sidebar)
2. **New table** → Table name: `orders`
3. Columns add karo (one by one):

| Column Name   | Type        | Default Value      | Nullable |
|---------------|-------------|-------------------|----------|
| id            | uuid        | gen_random_uuid() | No       |
| order_id      | text        | -                 | No       |
| name          | text        | -                 | No       |
| phone         | text        | -                 | No       |
| email         | text        | -                 | Yes      |
| address       | text        | -                 | Yes      |
| address_line1 | text        | -                 | Yes      |
| address_line2 | text        | -                 | Yes      |
| city          | text        | -                 | Yes      |
| district      | text        | -                 | Yes      |
| state         | text        | -                 | Yes      |
| pincode       | text        | -                 | Yes      |
| quantity      | int4        | 1                 | Yes      |
| total_amount  | int4        | -                 | No       |
| payment_method| text        | cod               | Yes      |
| utm_source    | text        | -                 | Yes      |
| utm_medium    | text        | -                 | Yes      |
| utm_campaign  | text        | -                 | Yes      |
| created_at    | timestamptz | now()             | Yes      |

4. **id** ko Primary Key banao (right-click column → Set as primary key)
5. **Save** karo

Done. Ab submit-order function kaam karega.
