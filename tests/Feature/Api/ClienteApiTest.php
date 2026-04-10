<?php

namespace Tests\Feature\Api;

use App\Models\Cliente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class ClienteApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_lists_clients_with_filters_and_excludes_archived(): void
    {
        $clienteVisible = Cliente::factory()->create([
            'nombre' => 'Ana',
            'empresa' => 'Acme Solar',
            'estado' => 'activo',
        ]);

        Cliente::factory()->create([
            'nombre' => 'Luis',
            'empresa' => 'Beta Logistics',
            'estado' => 'inactivo',
        ]);

        $archived = Cliente::factory()->create([
            'nombre' => 'Archivo',
            'empresa' => 'Acme Legacy',
            'estado' => 'activo',
        ]);
        $archived->delete();

        $response = $this->getJson('/api/clientes?search=Acme&estado=activo&per_page=1');

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $clienteVisible->id);
    }

    public function test_it_creates_updates_and_archives_a_client(): void
    {
        $createResponse = $this->postJson('/api/clientes', [
            'nombre' => 'Lucia',
            'apellidos' => 'Martinez Vega',
            'empresa' => 'Lumen CRM',
            'email' => 'lucia@example.com',
            'estado' => 'activo',
        ]);

        $clienteId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.nombre', 'Lucia');

        $this->putJson("/api/clientes/{$clienteId}", [
            'nombre' => 'Lucia',
            'apellidos' => 'Martinez Vega',
            'empresa' => 'Lumen CRM Group',
            'email' => 'lucia@example.com',
            'estado' => 'inactivo',
        ])->assertOk()
            ->assertJsonPath('data.empresa', 'Lumen CRM Group')
            ->assertJsonPath('data.estado', 'inactivo');

        $this->deleteJson("/api/clientes/{$clienteId}")
            ->assertNoContent();

        $this->assertSoftDeleted('clientes', ['id' => $clienteId]);
        $this->getJson('/api/clientes')
            ->assertOk()
            ->assertJsonMissing(['id' => $clienteId]);
    }

    public function test_it_validates_required_fields_for_cliente(): void
    {
        $this->postJson('/api/clientes', [
            'estado' => 'activo',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['nombre']);
    }
}
