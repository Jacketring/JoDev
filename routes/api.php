<?php

use App\Http\Controllers\Api\ActividadController;
use App\Http\Controllers\Api\AuthenticatedSessionController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\ContactoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GlobalSearchController;
use App\Http\Controllers\Api\OpcionesController;
use App\Http\Controllers\Api\OportunidadController;
use App\Http\Controllers\Api\TareaController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VisualSettingsController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->prefix('auth')->group(function () {
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
    Route::get('/user', [AuthenticatedSessionController::class, 'show'])->middleware('auth');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
});

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/dashboard', DashboardController::class);
    Route::get('/opciones', OpcionesController::class);
    Route::get('/busqueda-global', GlobalSearchController::class);
    Route::get('/ajustes-visuales', [VisualSettingsController::class, 'show']);
    Route::put('/ajustes-visuales', [VisualSettingsController::class, 'update']);
    Route::apiResource('usuarios', UserController::class)
        ->only(['index', 'store', 'show', 'update'])
        ->parameters(['usuarios' => 'user']);

    Route::apiResource('clientes', ClienteController::class)
        ->parameters(['clientes' => 'cliente']);
    Route::apiResource('contactos', ContactoController::class)
        ->parameters(['contactos' => 'contacto']);
    Route::apiResource('oportunidades', OportunidadController::class)
        ->parameters(['oportunidades' => 'oportunidad']);
    Route::apiResource('actividades', ActividadController::class)
        ->parameters(['actividades' => 'actividad']);
    Route::apiResource('tareas', TareaController::class)
        ->parameters(['tareas' => 'tarea']);
});
