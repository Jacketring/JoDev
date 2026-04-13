<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthenticatedSessionController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! $this->isConfigured()) {
            return redirect()->route('login', [
                'auth_error' => 'google_not_configured',
            ]);
        }

        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        if (! $this->isConfigured()) {
            return $this->redirectWithError('google_not_configured');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return $this->redirectWithError('google_auth_failed');
        }

        $email = $googleUser->getEmail();

        if (! $email) {
            return $this->redirectWithError('google_email_missing');
        }

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [mb_strtolower($email)])
            ->first();

        if (! $user) {
            return $this->redirectWithError('google_account_missing');
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect('/dashboard');
    }

    protected function isConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'))
            && filled(config('services.google.redirect'));
    }

    protected function redirectWithError(string $error): RedirectResponse
    {
        return redirect()->route('login', [
            'auth_error' => $error,
        ]);
    }
}
