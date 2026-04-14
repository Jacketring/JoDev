<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\Contacto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Contacto>
 */
class ContactoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cliente_id' => Cliente::factory(),
            'nombre' => fake()->firstName(),
            'apellidos' => fake()->lastName().' '.fake()->lastName(),
            'cargo' => fake()->jobTitle(),
            'email' => fake()->unique()->safeEmail(),
            'telefono' => fake()->numerify('9########'),
            'movil' => fake()->numerify('6########'),
            'es_principal' => fake()->boolean(20),
            'notas' => fake()->sentence(),
        ];
    }
}
