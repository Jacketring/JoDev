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
        $fecha = fake()->dateTimeBetween('-15 days', '+15 days');

        return [
            'cliente_id' => Cliente::factory(),
            'contacto_id' => null,
            'oportunidad_id' => null,
            'tipo' => fake()->randomElement(Actividad::TIPOS),
            'asunto' => fake()->sentence(5),
            'descripcion' => fake()->paragraph(),
            'fecha_actividad' => $fecha,
            'completada' => $fecha < now(),
        ];
    }
}
