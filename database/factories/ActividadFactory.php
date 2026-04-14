<?php

namespace Database\Factories;

use App\Models\Actividad;
use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Actividad>
 */
class ActividadFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cliente_id' => Cliente::factory(),
            'contacto_id' => null,
            'oportunidad_id' => null,
            'tipo' => fake()->randomElement(Actividad::TIPOS),
            'asunto' => fake()->sentence(4),
            'descripcion' => fake()->paragraph(),
            'fecha_actividad' => fake()->dateTimeBetween('-7 days', '+14 days'),
            'completada' => fake()->boolean(35),
        ];
    }
}
