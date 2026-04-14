<?php

namespace Tests\Feature\Api;

use App\Models\Actividad;
use App\Models\Cliente;
use App\Models\Oportunidad;
use App\Models\Tarea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class DashboardApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_returns_cross_entity_dashboard_metrics_and_lists(): void
    {
        Cliente::factory()->create(['estado' => 'activo']);
        Cliente::factory()->create(['estado' => 'inactivo']);
        Cliente::factory()->create([
            'estado' => 'activo',
            'created_at' => now()->subDays(45),
        ]);

        $cliente = Cliente::factory()->create(['estado' => 'activo']);

        Oportunidad::factory()->create([
            'cliente_id' => $cliente->id,
            'fase' => 'nuevo',
            'estado' => 'abierta',
            'valor_estimado' => 12000,
        ]);
        Oportunidad::factory()->create([
            'cliente_id' => $cliente->id,
            'fase' => 'propuesta',
            'estado' => 'abierta',
            'valor_estimado' => 18000,
        ]);

        Actividad::factory()->create([
            'cliente_id' => $cliente->id,
            'fecha_actividad' => now()->addDay(),
            'completada' => false,
        ]);

        Tarea::factory()->create([
            'cliente_id' => $cliente->id,
            'estado' => 'pendiente',
            'fecha_vencimiento' => now()->subDay(),
        ]);
        Tarea::factory()->create([
            'cliente_id' => $cliente->id,
            'estado' => 'en_progreso',
            'fecha_vencimiento' => now()->addDay(),
        ]);

        $response = $this->getJson('/api/dashboard');

        $response
            ->assertOk()
            ->assertJsonPath('metricas.clientes_activos', 3)
            ->assertJsonPath('metricas.clientes_totales', 4)
            ->assertJsonPath('metricas.clientes_nuevos_30_dias', 3)
            ->assertJsonPath('metricas.oportunidades_abiertas', 2)
            ->assertJsonPath('metricas.valor_pipeline', 30000)
            ->assertJsonPath('metricas.tareas_pendientes', 2)
            ->assertJsonPath('metricas.actividades_proximas', 1)
            ->assertJsonPath('distribuciones.clientes_estado.total', 4)
            ->assertJsonPath('distribuciones.clientes_estado.items.0.clave', 'activo')
            ->assertJsonPath('distribuciones.clientes_estado.items.0.total', 3)
            ->assertJsonPath('distribuciones.clientes_estado.items.1.clave', 'inactivo')
            ->assertJsonPath('distribuciones.clientes_estado.items.1.total', 1)
            ->assertJsonPath('distribuciones.tareas_estado.total', 2)
            ->assertJsonPath('embudo.0.fase', 'nuevo')
            ->assertJsonPath('embudo.0.total', 1)
            ->assertJsonPath('embudo.1.fase', 'propuesta')
            ->assertJsonPath('embudo.1.valor', 18000)
            ->assertJsonCount(4, 'clientes_recientes')
            ->assertJsonCount(2, 'oportunidades_recientes')
            ->assertJsonCount(1, 'actividades_proximas')
            ->assertJsonCount(1, 'tareas_vencidas');
    }
}
