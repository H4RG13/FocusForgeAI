<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL stores enum as a CHECK constraint — drop it, migrate data, re-add
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
        DB::statement("UPDATE users SET role = 'student' WHERE role = 'user'");
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student'");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'teacher', 'admin'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
        DB::statement("UPDATE users SET role = 'user' WHERE role IN ('student', 'teacher')");
        DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'))");
    }
};
