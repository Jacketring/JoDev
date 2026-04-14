<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\Oportunidad;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Oportunidad>
 */
class OportunidadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cliente_id' => Cliente::factory(),
            'titulo' => fake()->sentence(4),
            'descripcion' => fake()->paragraph(),
            'valor_estimado' => fake()->numberBetween(1000, 50000),
            'fase' => fake()->randomElement(Oportunidad::FASES),
            'probabilidad' => fake()->numberBetween(10, 90),
            'fecha_cierre_estimada' => fake()->dateTimeBetween('now', '+90 days'),
            'estado' => fake()->randomElement(Oportunidad::ESTADOS),
        ];
    }
}
