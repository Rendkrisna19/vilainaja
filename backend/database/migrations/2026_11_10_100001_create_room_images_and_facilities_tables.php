<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->string('path', 255);            // gambar utama (WebP), mis. uploads/rooms/3/abc.webp
            $table->string('thumb_path', 255);      // versi kecil untuk kartu & galeri
            $table->unsignedSmallInteger('width');
            $table->unsignedSmallInteger('height');
            $table->unsignedInteger('bytes');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['room_id', 'sort_order']);
        });

        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80)->unique();
            $table->string('icon', 40)->default('check');   // nama ikon di frontend
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('facility_room', function (Blueprint $table) {
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->primary(['room_id', 'facility_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facility_room');
        Schema::dropIfExists('facilities');
        Schema::dropIfExists('room_images');
    }
};
