<?php

namespace Tests\Feature\Api;

use App\Models\Cliente;
use App\Models\Oportunidad;
use App\Models\Tarea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class TareaApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_task_and_infers_the_client_from_the_opportunity(): void
    {
        $cliente = Cliente::factory()->create();
        $oportunidad = Oportunidad::factory()->for($cliente)->create();

        $response = $this->postJson('/api/tareas', [
            'oportunidad_id' => $oportunidad->id,
            'titulo' => 'Enviar propuesta final',
            'prioridad' => 'alta',
            'estado' => 'pendiente',
            'fecha_vencimiento' => now()->addDays(2)->toIso8601String(),
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.cliente_id', $cliente->id)
            ->assertJsonPath('data.oportunidad_id', $oportunidad->id);
    }

    public function test_it_filters_overdue_tasks(): void
    {
        $cliente = Cliente::factory()->create();
        $vencida = Tarea::factory()->for($cliente)->create([
            'estado' => 'pendiente',
            'fecha_vencimiento' => now()->subDay(),
        ]);

        Tarea::factory()->for($cliente)->create([
            'estado' => 'completada',
            'fecha_vencimiento' => now()->subDay(),
        ]);

        Tarea::factory()->for($cliente)->create([
            'estado' => 'pendiente',
            'fecha_vencimiento' => now()->addDay(),
        ]);

        $response = $this->getJson("/api/tareas?cliente_id={$cliente->id}&vencidas=1");

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $vencida->id);
    }
}
