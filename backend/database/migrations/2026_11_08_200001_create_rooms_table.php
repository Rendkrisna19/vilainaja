<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tag')->nullable();
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->unsignedSmallInteger('size')->default(0);      // luas, m²
            $table->unsignedTinyInteger('capacity')->default(2);   // jumlah tamu
            $table->string('bed')->nullable();
            $table->unsignedInteger('price');                      // per malam, Rupiah
            $table->unsignedSmallInteger('stock')->default(1);     // jumlah unit
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
