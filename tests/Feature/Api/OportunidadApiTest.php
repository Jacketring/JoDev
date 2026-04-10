<?php

namespace Tests\Feature\Api;

use App\Models\Cliente;
use App\Models\Oportunidad;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class OportunidadApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_filters_opportunities_by_phase_and_status(): void
    {
        $cliente = Cliente::factory()->create();
        $objetivo = Oportunidad::factory()->for($cliente)->create([
            'fase' => 'propuesta',
            'estado' => 'abierta',
        ]);

        Oportunidad::factory()->for($cliente)->create([
            'fase' => 'negociacion',
            'estado' => 'cerrada',
        ]);

        $response = $this->getJson("/api/oportunidades?cliente_id={$cliente->id}&fase=propuesta&estado=abierta");

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $objetivo->id);
    }

    public function test_it_creates_updates_and_archives_an_opportunity(): void
    {
        $cliente = Cliente::factory()->create();

        $createResponse = $this->postJson('/api/oportunidades', [
            'cliente_id' => $cliente->id,
            'titulo' => 'Proyecto ERP',
            'descripcion' => 'Migracion comercial',
            'valor_estimado' => 12000,
            'fase' => 'nuevo',
            'probabilidad' => 20,
            'estado' => 'abierta',
        ]);

        $oportunidadId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.titulo', 'Proyecto ERP');

        $this->putJson("/api/oportunidades/{$oportunidadId}", [
            'cliente_id' => $cliente->id,
            'titulo' => 'Proyecto ERP Enterprise',
            'descripcion' => 'Migracion comercial',
            'valor_estimado' => 18000,
            'fase' => 'negociacion',
            'probabilidad' => 65,
            'estado' => 'abierta',
        ])->assertOk()
            ->assertJsonPath('data.fase', 'negociacion')
            ->assertJsonPath('data.valor_estimado', 18000);

        $this->deleteJson("/api/oportunidades/{$oportunidadId}")
            ->assertNoContent();

        $this->assertSoftDeleted('oportunidades', ['id' => $oportunidadId]);
    }

    public function test_it_validates_probability_for_opportunities(): void
    {
        $cliente = Cliente::factory()->create();

        $this->postJson('/api/oportunidades', [
            'cliente_id' => $cliente->id,
            'titulo' => 'Proyecto invalido',
            'fase' => 'nuevo',
            'probabilidad' => 120,
            'estado' => 'abierta',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['probabilidad']);
    }
}
