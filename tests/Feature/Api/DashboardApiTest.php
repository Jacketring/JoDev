<?php

namespace Tests\Feature\Api;

use App\Models\Actividad;
use App\Models\Cliente;
use App\Models\Contacto;
use App\Models\Oportunidad;
use App\Models\Tarea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class DashboardApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_returns_dashboard_metrics_and_lists(): void
    {
        $cliente = Cliente::factory()->create(['estado' => 'activo']);
        $contacto = Contacto::factory()->for($cliente)->create();
        $oportunidad = Oportunidad::factory()->for($cliente)->create([
            'estado' => 'abierta',
            'fase' => 'propuesta',
            'valor_estimado' => 15000,
        ]);

        Actividad::factory()->for($cliente)->create([
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'fecha_actividad' => now()->addDay(),
        ]);

        Tarea::factory()->for($cliente)->create([
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'estado' => 'pendiente',
            'fecha_vencimiento' => now()->subDay(),
        ]);

        $response = $this->getJson('/api/dashboard');

        $response
            ->assertOk()
            ->assertJsonPath('metricas.clientes_activos', 1)
            ->assertJsonPath('metricas.oportunidades_abiertas', 1)
            ->assertJsonPath('metricas.valor_pipeline', 15000)
            ->assertJsonCount(1, 'actividades_proximas')
            ->assertJsonCount(1, 'tareas_vencidas');
    }
}
