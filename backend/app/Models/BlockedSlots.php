<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class BlockedSlots extends Model
{
    use HasFactory;
    protected $table = 'blocked_slots';

    protected $fillable = [
        "id",
        'date',
        'start_time',
        'end_time',
        'reason',
    ];



}
