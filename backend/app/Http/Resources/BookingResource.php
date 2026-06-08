<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'booking_ref'      => $this->booking_ref,
            'status'           => $this->status,
            'appointment_date' => $this->appointment_date,
            'appointment_start'=> $this->appointment_start,
            'appointment_end'  => $this->appointment_end,

            // بيانات طبية
            'complaints'       => $this->complaints,
            'conditions'       => $this->conditions,
            'goals'            => $this->goals,
            'pain_level'       => $this->pain_level,
            'injury_location'  => $this->injury_location,
            'notes'            => $this->notes,

            // حقول جديدة
            'gender'           => $this->gender,
            'rehab_timing'     => $this->rehab_timing,
            'blood_thinner'    => $this->blood_thinner,

            // relations
            'therapy_session'  => $this->whenLoaded('therapySession'),
            'user'             => $this->whenLoaded('user'),

            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }
}

