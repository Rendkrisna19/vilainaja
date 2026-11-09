<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email')->index();   // WhatsApp, format 62…
            $table->string('role', 20)->default('customer')->after('password')->index();
            $table->string('firebase_uid')->nullable()->unique()->after('role');
            $table->string('avatar_url', 500)->nullable()->after('firebase_uid');
        });

        // Akun yang sudah ada sebelum kolom role dibuat adalah admin.
        DB::table('users')->update(['role' => 'admin']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role', 'firebase_uid', 'avatar_url']);
        });
    }
};
