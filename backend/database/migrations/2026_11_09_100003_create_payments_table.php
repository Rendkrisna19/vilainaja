<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('order_id', 50)->unique();                       // = kode booking
            $table->unsignedBigInteger('gross_amount');
            $table->string('status', 20)->default('pending');               // pending|paid|failed|cancelled|expired|refund_needed
            $table->string('snap_token', 100)->nullable();
            $table->string('redirect_url', 500)->nullable();
            $table->string('payment_type', 50)->nullable();
            $table->string('transaction_id', 100)->nullable();
            $table->string('fraud_status', 20)->nullable();
            $table->json('raw')->nullable();                                // notifikasi terakhir dari Midtrans
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
