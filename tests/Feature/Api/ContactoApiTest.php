<?php

namespace Tests\Feature\Api;

use App\Models\Cliente;
use App\Models\Contacto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class ContactoApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_filters_contacts_by_client_and_primary_status(): void
    {
        $cliente = Cliente::factory()->create();
        $otroCliente = Cliente::factory()->create();

        $principal = Contacto::factory()->for($cliente)->create([
            'nombre' => 'Sara',
            'es_principal' => true,
        ]);

        Contacto::factory()->for($cliente)->create(['nombre' => 'Marta']);
        Contacto::factory()->for($otroCliente)->create(['nombre' => 'David', 'es_principal' => true]);

        $response = $this->getJson("/api/contactos?cliente_id={$cliente->id}&es_principal=1");

        $response
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $principal->id);
    }

    public function test_it_creates_a_new_primary_contact_and_unsets_the_previous_one(): void
    {
        $cliente = Cliente::factory()->create();
        $anterior = Contacto::factory()->for($cliente)->create(['es_principal' => true]);

        $response = $this->postJson('/api/contactos', [
            'cliente_id' => $cliente->id,
            'nombre' => 'Nuevo',
            'apellidos' => 'Principal',
            'cargo' => 'CEO',
            'email' => 'nuevo@example.com',
            'es_principal' => true,
        ]);

        $nuevoId = $response->json('data.id');

        $response
            ->assertCreated()
            ->assertJsonPath('data.es_principal', true);

        $this->assertDatabaseHas('contactos', [
            'id' => $nuevoId,
            'es_principal' => 1,
        ]);

        $this->assertDatabaseHas('contactos', [
            'id' => $anterior->id,
            'es_principal' => 0,
        ]);
    }

    public function test_it_validates_the_client_reference_for_contacts(): void
    {
        $this->postJson('/api/contactos', [
            'cliente_id' => 999,
            'nombre' => 'Invalido',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['cliente_id']);
    }
}
