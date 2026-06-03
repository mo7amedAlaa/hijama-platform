<?php

namespace App\Policies;

use App\Models\User;

class AdminPolicy
{
    public function admin(User $user): bool
    {
        return $user->isAdmin();
    }
}
