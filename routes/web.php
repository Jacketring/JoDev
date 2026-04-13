<?php

use App\Http\Controllers\Auth\GoogleAuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/auth/google/redirect', [GoogleAuthenticatedSessionController::class, 'redirect'])
    ->name('auth.google.redirect');

Route::get('/auth/google/callback', [GoogleAuthenticatedSessionController::class, 'callback'])
    ->name('auth.google.callback');

Route::view('/login', 'app')->name('login');

Route::view('/{any?}', 'app')
    ->where('any', '^(?!api(?:/|$)|up$).*$');
