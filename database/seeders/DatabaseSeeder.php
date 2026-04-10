<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $clientePortal = Cliente::query()->updateOrCreate(
            ['empresa' => 'Cliente JoDev'],
            [
                'nombre' => 'Cuenta',
                'apellidos' => 'Cliente',
                'email' => 'cliente@jodev.es',
                'telefono' => '+34 600 000 001',
                'estado' => 'activo',
                'pais' => 'Espana',
                'web' => 'https://cliente.jodev.es',
                'origen' => 'portal',
                'notas' => 'Empresa vinculada al portal cliente.',
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'admin@jodev.es'],
            [
                'name' => 'Jose Versens',
                'password' => 'JoDev2026!',
                'role' => 'administrador',
                'cliente_id' => null,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'cliente@jodev.es'],
            [
                'name' => 'Cliente JoDev',
                'password' => 'Cliente2026!',
                'role' => 'cliente',
                'cliente_id' => $clientePortal->id,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ],
        );
    }
}
