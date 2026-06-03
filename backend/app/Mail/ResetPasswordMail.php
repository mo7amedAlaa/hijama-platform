<?php


namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $email;

    public function __construct($token, $email)
    {
        $this->token = $token;
        $this->email = $email;
    }

    public function build()
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        $url = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . $this->email;

        return $this->subject('Reset Your Password')
            ->view('emails.reset-password')
            ->with([
                'url' => $url
            ]);
    }
}
