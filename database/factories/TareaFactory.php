<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\Tarea;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tarea>
 */
class TareaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cliente_id' => Cliente::factory(),
            'contacto_id' => null,
            'oportunidad_id' => null,
            'titulo' => fake()->sentence(5),
            'descripcion' => fake()->paragraph(),
            'prioridad' => fake()->randomElement(Tarea::PRIORIDADES),
            'estado' => fake()->randomElement(Tarea::ESTADOS),
            'fecha_vencimiento' => fake()->dateTimeBetween('-10 days', '+20 days'),
        ];
    }
}
