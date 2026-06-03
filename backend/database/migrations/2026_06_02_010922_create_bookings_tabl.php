<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('therapy_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('slot_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->string('booking_ref')->unique();         // CS-XXXX
            $table->text('notes')->nullable();

            // بيانات الشكوى
            $table->json('complaints')->nullable();
            $table->json('conditions')->nullable();          // التاريخ المرضي
            $table->json('goals')->nullable();
            $table->string('pain_level')->nullable();
            $table->string('injury_location')->nullable();
            $table->string('injury_duration')->nullable();

            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('bookings'); }
};
