<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\TherapySession;
use App\Models\Slot;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name'     => 'CORE Admin',
            'email'    => 'admin@cores.sa',
            'password' => Hash::make('Admin@1234'),
            'role'     => 'admin',
            'phone'    => '0500000000',
        ]);

        // Client تجريبي
        User::create([
            'name'     => 'محمد العلي',
            'email'    => 'client@test.sa',
            'password' => Hash::make('Client@1234'),
            'role'     => 'customer',
            'phone'    => '0511111111',
        ]);

        // أنواع الجلسات
        $sessions = [
            ['name' => 'Cupping',          'name_ar' => 'حجامة',                    'duration_minutes' => 60,  'price' => 250],
            ['name' => 'Therapeutic Massage','name_ar' => 'مساج علاجي',             'duration_minutes' => 60,  'price' => 200],
            ['name' => 'Cupping + Massage', 'name_ar' => 'حجامة + مساج',            'duration_minutes' => 90,  'price' => 400],
            ['name' => 'Sports Recovery',   'name_ar' => 'مساج استشفائي رياضي',     'duration_minutes' => 75,  'price' => 300],
            ['name' => 'Injury Rehab',      'name_ar' => 'تأهيل إصابات',            'duration_minutes' => 90,  'price' => 350],
        ];

        foreach ($sessions as $s) {
            TherapySession::create(array_merge($s, ['is_active' => true]));
        }

        // مواعيد اليوم التالي (مثال)
        $date   = now()->addDay()->toDateString();
        $times  = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];

        foreach ($times as $i => $time) {
            $end = date('H:i', strtotime($time) + 3600);
            Slot::create([
                'date'         => $date,
                'start_time'   => $time,
                'end_time'     => $end,
                'is_available' => true,
            ]);
        }
    }
}
