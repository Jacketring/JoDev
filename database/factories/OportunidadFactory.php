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
        $isOpen = fake()->boolean(70);
        $fase = $isOpen
            ? fake()->randomElement(array_slice(Oportunidad::FASES, 0, 4))
            : fake()->randomElement(['ganado', 'perdido']);

        return [
            'cliente_id' => Cliente::factory(),
            'titulo' => fake()->sentence(4),
            'descripcion' => fake()->paragraph(),
            'valor_estimado' => fake()->randomFloat(2, 1500, 75000),
            'fase' => $fase,
            'probabilidad' => $isOpen ? fake()->numberBetween(10, 90) : ($fase === 'ganado' ? 100 : 0),
            'fecha_cierre_estimada' => fake()->dateTimeBetween('-20 days', '+45 days'),
            'estado' => $isOpen ? 'abierta' : 'cerrada',
        ];
    }
}
