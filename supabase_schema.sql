-- Supabase Database Schema Migration
-- Run this in your Supabase SQL Editor to configure the tables and Row-Level Security (RLS).

-- 1. Create or Update habits table
create table if not exists habits (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    color text default 'stone',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    archived_at timestamp with time zone default null
);

-- Enable RLS on habits
alter table habits enable row level security;

-- Policy to allow users to manage their own habits
create policy "Users can manage their own habits" on habits
    for all using (auth.uid() = user_id);


-- 2. Create completions table
create table if not exists completions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    habit_id uuid references habits(id) on delete cascade not null,
    date date not null, -- format YYYY-MM-DD
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (habit_id, date)
);

-- Enable RLS on completions
alter table completions enable row level security;

-- Policy to allow users to manage their own completions
create policy "Users can manage their own completions" on completions
    for all using (auth.uid() = user_id);


-- 3. Create monthly_goals table (if not exists)
create table if not exists monthly_goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    completed boolean default false not null,
    month text not null, -- format YYYY-MM
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on monthly_goals
alter table monthly_goals enable row level security;

-- Policy to allow users to manage their own monthly goals
create policy "Users can manage their own monthly_goals" on monthly_goals
    for all using (auth.uid() = user_id);
