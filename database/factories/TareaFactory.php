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
            'assigned_user_id' => null,
            'titulo' => fake()->sentence(4),
            'descripcion' => fake()->paragraph(),
            'prioridad' => fake()->randomElement(Tarea::PRIORIDADES),
            'estado' => fake()->randomElement(Tarea::ESTADOS),
            'fecha_vencimiento' => fake()->dateTimeBetween('-3 days', '+21 days'),
        ];
    }
}
