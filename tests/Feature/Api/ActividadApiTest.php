<?php

namespace Tests\Feature\Api;

use App\Models\Cliente;
use App\Models\Contacto;
use App\Models\Oportunidad;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class ActividadApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_creates_an_activity_and_infers_the_client_from_the_contact(): void
    {
        $cliente = Cliente::factory()->create();
        $contacto = Contacto::factory()->for($cliente)->create();

        $response = $this->postJson('/api/actividades', [
            'contacto_id' => $contacto->id,
            'tipo' => 'llamada',
            'asunto' => 'Seguimiento inicial',
            'fecha_actividad' => now()->addDay()->toIso8601String(),
            'completada' => false,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.cliente_id', $cliente->id)
            ->assertJsonPath('data.contacto_id', $contacto->id);
    }

    public function test_it_rejects_mismatched_relationships_for_activities(): void
    {
        $clienteUno = Cliente::factory()->create();
        $clienteDos = Cliente::factory()->create();
        $contacto = Contacto::factory()->for($clienteUno)->create();
        $oportunidad = Oportunidad::factory()->for($clienteDos)->create();

        $this->postJson('/api/actividades', [
            'cliente_id' => $clienteUno->id,
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'tipo' => 'email',
            'asunto' => 'Cruce no valido',
            'fecha_actividad' => now()->toIso8601String(),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['oportunidad_id']);
    }

    public function test_it_filters_activities_by_type_and_completion(): void
    {
        $cliente = Cliente::factory()->create();
        $esperada = \App\Models\Actividad::factory()->for($cliente)->create([
            'tipo' => 'reunion',
            'completada' => true,
        ]);

        \App\Models\Actividad::factory()->for($cliente)->create([
            'tipo' => 'llamada',
            'completada' => false,
        ]);

        $response = $this->getJson("/api/actividades?cliente_id={$cliente->id}&tipo=reunion&completada=1");

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $esperada->id);
    }
}
