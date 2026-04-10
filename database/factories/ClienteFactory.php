<?php

namespace Database\Factories;

use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cliente>
 */
class ClienteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => fake()->firstName(),
            'apellidos' => fake()->lastName().' '.fake()->lastName(),
            'empresa' => fake()->company(),
            'email' => fake()->unique()->safeEmail(),
            'telefono' => fake()->numerify('9########'),
            'movil' => fake()->numerify('6########'),
            'direccion' => fake()->streetAddress(),
            'ciudad' => fake()->city(),
            'provincia' => fake()->state(),
            'codigo_postal' => fake()->postcode(),
            'pais' => fake()->country(),
            'web' => fake()->url(),
            'origen' => fake()->randomElement(['web', 'referido', 'evento', 'campana', 'llamada']),
            'estado' => fake()->randomElement(Cliente::ESTADOS),
            'notas' => fake()->sentence(),
        ];
    }
}
