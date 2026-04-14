<?php

namespace Tests\Feature\Api;

use App\Models\Actividad;
use App\Models\Cliente;
use App\Models\Contacto;
use App\Models\Oportunidad;
use App\Models\Tarea;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class GlobalSearchApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_returns_grouped_results_for_all_entities(): void
    {
        $cliente = Cliente::factory()->create([
            'nombre' => 'Ana',
            'empresa' => 'Acme Solar',
            'estado' => 'activo',
        ]);
        $contacto = Contacto::factory()->create([
            'cliente_id' => $cliente->id,
            'nombre' => 'Ana',
            'apellidos' => 'Lopez',
        ]);
        $oportunidad = Oportunidad::factory()->create([
            'cliente_id' => $cliente->id,
            'titulo' => 'Acme Upgrade',
            'fase' => 'nuevo',
            'estado' => 'abierta',
        ]);
        $actividad = Actividad::factory()->create([
            'cliente_id' => $cliente->id,
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'asunto' => 'Llamada Acme',
        ]);
        $tarea = Tarea::factory()->create([
            'cliente_id' => $cliente->id,
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'titulo' => 'Preparar propuesta Acme',
        ]);

        $response = $this->getJson('/api/busqueda-global?q=Acme');

        $response
            ->assertOk()
            ->assertJsonPath('total', 5)
            ->assertJsonPath('results.0.entity', 'clientes')
            ->assertJsonPath('results.0.items.0.id', $cliente->id)
            ->assertJsonPath('results.1.entity', 'contactos')
            ->assertJsonPath('results.1.items.0.id', $contacto->id)
            ->assertJsonPath('results.2.entity', 'oportunidades')
            ->assertJsonPath('results.2.items.0.id', $oportunidad->id)
            ->assertJsonPath('results.3.entity', 'actividades')
            ->assertJsonPath('results.3.items.0.id', $actividad->id)
            ->assertJsonPath('results.4.entity', 'tareas')
            ->assertJsonPath('results.4.items.0.id', $tarea->id);
    }

    public function test_it_respects_client_scope_in_global_search(): void
    {
        $clientePropio = Cliente::factory()->create([
            'empresa' => 'Acme Propio',
            'estado' => 'activo',
        ]);
        $clienteAjeno = Cliente::factory()->create([
            'empresa' => 'Acme Ajeno',
            'estado' => 'activo',
        ]);

        Contacto::factory()->create([
            'cliente_id' => $clientePropio->id,
            'nombre' => 'Ana',
            'apellidos' => 'Propia',
        ]);
        Contacto::factory()->create([
            'cliente_id' => $clienteAjeno->id,
            'nombre' => 'Ana',
            'apellidos' => 'Ajena',
        ]);

        $clientUser = User::factory()->create([
            'role' => 'cliente',
            'cliente_id' => $clientePropio->id,
        ]);

        $this->actingAs($clientUser);

        $this->getJson('/api/busqueda-global?q=Acme')
            ->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonPath('results.0.items.0.title', 'Acme Propio')
            ->assertJsonMissing(['title' => 'Acme Ajeno']);
    }
}
