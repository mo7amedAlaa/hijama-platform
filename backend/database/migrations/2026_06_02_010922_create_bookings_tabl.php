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

            // الموعد مباشرة بدون foreign key لـ slots
            $table->date('appointment_date');
            $table->time('appointment_time');

            $table->enum('status', ['pending','confirmed','cancelled','completed'])
                  ->default('pending');
            $table->string('booking_ref')->unique();
            $table->text('notes')->nullable();

            // بيانات طبية
            $table->json('complaints')->nullable();
            $table->json('conditions')->nullable();
            $table->json('goals')->nullable();
            $table->string('pain_level')->nullable();
            $table->string('injury_location')->nullable();

            $table->timestamps();

            // منع حجز نفس الوقت مرتين
            $table->unique(['appointment_date', 'appointment_time']);
        });
    }
    public function down(): void { Schema::dropIfExists('bookings'); }
};
