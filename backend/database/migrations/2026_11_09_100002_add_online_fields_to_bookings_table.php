<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('room_id')->constrained()->nullOnDelete();
            $table->string('source', 10)->default('admin')->after('status');          // admin | online
            $table->timestamp('expires_at')->nullable()->index();                      // batas bayar (online, pending)
            $table->string('idempotency_key', 64)->nullable()->unique();               // cegah booking ganda dari klik ulang
            $table->string('cancel_reason')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['source', 'expires_at', 'idempotency_key', 'cancel_reason']);
        });
    }
};
