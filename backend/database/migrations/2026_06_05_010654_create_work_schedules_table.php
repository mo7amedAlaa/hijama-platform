<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('work_schedules', function (Blueprint $table) {
            $table->id();
            $table->tinyInteger('day_of_week')->unique(); // 0=أحد…6=سبت
            $table->time('start_time')->default('08:00');
            $table->time('end_time')->default('20:00');
            $table->integer('slot_duration')->default(60); // دقيقة
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('work_schedules'); }
};
