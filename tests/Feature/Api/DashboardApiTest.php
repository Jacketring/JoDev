<?php

namespace Tests\Feature\Api;

use App\Models\Cliente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class DashboardApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_returns_client_only_dashboard_metrics_and_lists(): void
    {
        Cliente::factory()->create(['estado' => 'activo']);
        Cliente::factory()->create(['estado' => 'inactivo']);
        Cliente::factory()->create([
            'estado' => 'activo',
            'created_at' => now()->subDays(45),
        ]);

        $response = $this->getJson('/api/dashboard');

        $response
            ->assertOk()
            ->assertJsonPath('metricas.clientes_activos', 2)
            ->assertJsonPath('metricas.clientes_totales', 3)
            ->assertJsonPath('metricas.clientes_nuevos_30_dias', 2)
            ->assertJsonPath('distribuciones.clientes_estado.total', 3)
            ->assertJsonPath('distribuciones.clientes_estado.items.0.clave', 'activo')
            ->assertJsonPath('distribuciones.clientes_estado.items.0.total', 2)
            ->assertJsonPath('distribuciones.clientes_estado.items.1.clave', 'inactivo')
            ->assertJsonPath('distribuciones.clientes_estado.items.1.total', 1)
            ->assertJsonCount(3, 'clientes_recientes');
    }
}
