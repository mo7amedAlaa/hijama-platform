<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $fillable = [
        'type',
        'name',
        'phone',
        'message',
        'status',
        'user_id',
    ];
    public function user()
{
    return $this->belongsTo(User::class);
}
}
