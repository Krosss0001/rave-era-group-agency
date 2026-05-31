create table if not exists ticket_orders (
  id serial primary key,
  merchant_request_id text not null unique,
  ticket_type text not null,
  amount_kopiykas integer not null,
  currency text not null default 'UAH',
  status text not null default 'PENDING',
  customer_email text not null,
  customer_first_name text not null,
  customer_last_name text not null,
  customer_phone text,
  hpp_order_id text,
  redirect_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ticket_orders add column if not exists payment_status text not null default 'PENDING';
alter table ticket_orders add column if not exists order_status text not null default 'PENDING';
alter table ticket_orders add column if not exists alliancepay_callback_payload_safe jsonb;
alter table ticket_orders add column if not exists paid_at timestamptz;
alter table ticket_orders add column if not exists email_status text not null default 'PENDING';
alter table ticket_orders add column if not exists email_sent_at timestamptz;
alter table ticket_orders add column if not exists email_error_safe text;

create table if not exists tickets (
  id serial primary key,
  ticket_code text not null unique,
  order_id integer not null unique references ticket_orders(id),
  merchant_request_id text not null,
  hpp_order_id text,
  event_slug text not null,
  event_title text not null,
  ticket_type text not null,
  customer_email text not null,
  customer_first_name text not null,
  customer_last_name text not null,
  status text not null default 'ACTIVE',
  qr_payload text not null,
  qr_token_hash text,
  issued_at timestamptz not null default now(),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ticket_orders_merchant_request_id_idx on ticket_orders (merchant_request_id);
create index if not exists ticket_orders_hpp_order_id_idx on ticket_orders (hpp_order_id);
create unique index if not exists tickets_ticket_code_idx on tickets (ticket_code);
create index if not exists tickets_order_id_idx on tickets (order_id);
create index if not exists tickets_merchant_request_id_idx on tickets (merchant_request_id);
create index if not exists tickets_hpp_order_id_idx on tickets (hpp_order_id);
create index if not exists tickets_customer_email_idx on tickets (customer_email);
create index if not exists tickets_status_idx on tickets (status);
