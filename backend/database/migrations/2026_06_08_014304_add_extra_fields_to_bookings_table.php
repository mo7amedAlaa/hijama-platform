<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // الجنس
            $table->enum('gender', ['male', 'female'])->nullable()->after('injury_location');

            // تأهيل قبل أم بعد العملية
            $table->enum('rehab_timing', ['before', 'after'])->nullable()->after('gender');

            // هل يأخذ علاج سيولة دم
            $table->boolean('blood_thinner')->default(false)->after('rehab_timing');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['gender', 'rehab_timing', 'blood_thinner']);
        });
    }
};
