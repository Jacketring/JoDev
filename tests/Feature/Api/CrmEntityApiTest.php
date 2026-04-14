<?php

namespace Tests\Feature\Api;

use App\Models\Actividad;
use App\Models\Cliente;
use App\Models\Contacto;
use App\Models\Oportunidad;
use App\Models\Tarea;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class CrmEntityApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_lists_and_manages_contactos(): void
    {
        $cliente = Cliente::factory()->create(['empresa' => 'Acme Solar']);
        $visible = Contacto::factory()->create([
            'cliente_id' => $cliente->id,
            'nombre' => 'Ana',
            'apellidos' => 'Lopez',
            'cargo' => 'Directora',
            'es_principal' => true,
        ]);

        Contacto::factory()->create([
            'cliente_id' => $cliente->id,
            'nombre' => 'Luis',
            'es_principal' => false,
        ]);

        $archived = Contacto::factory()->create([
            'cliente_id' => $cliente->id,
            'nombre' => 'Archivado',
        ]);
        $archived->delete();

        $this->getJson('/api/contactos?search=Ana&es_principal=1')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $visible->id);

        $createResponse = $this->postJson('/api/contactos', [
            'cliente_id' => $cliente->id,
            'nombre' => 'Lucia',
            'apellidos' => 'Martinez',
            'cargo' => 'CEO',
            'email' => 'lucia@example.com',
            'es_principal' => true,
        ]);

        $contactoId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.nombre', 'Lucia');

        $this->putJson("/api/contactos/{$contactoId}", [
            'cliente_id' => $cliente->id,
            'nombre' => 'Lucia',
            'apellidos' => 'Martinez',
            'cargo' => 'Direccio n comercial',
            'email' => 'lucia@example.com',
            'es_principal' => false,
        ])->assertOk()
            ->assertJsonPath('data.cargo', 'Direccio n comercial')
            ->assertJsonPath('data.es_principal', false);

        $this->deleteJson("/api/contactos/{$contactoId}")
            ->assertNoContent();

        $this->assertSoftDeleted('contactos', ['id' => $contactoId]);
    }

    public function test_it_lists_and_manages_oportunidades(): void
    {
        $cliente = Cliente::factory()->create(['empresa' => 'Acme Solar']);
        $visible = Oportunidad::factory()->create([
            'cliente_id' => $cliente->id,
            'titulo' => 'Acme Expansion',
            'fase' => 'propuesta',
            'estado' => 'abierta',
        ]);

        Oportunidad::factory()->create([
            'cliente_id' => $cliente->id,
            'titulo' => 'Beta Migration',
            'fase' => 'nuevo',
            'estado' => 'pausada',
        ]);

        $this->getJson('/api/oportunidades?search=Acme&fase=propuesta&estado=abierta')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $visible->id);

        $createResponse = $this->postJson('/api/oportunidades', [
            'cliente_id' => $cliente->id,
            'titulo' => 'Nuevo contrato',
            'descripcion' => 'Upgrade anual',
            'valor_estimado' => 8000,
            'fase' => 'nuevo',
            'probabilidad' => 35,
            'fecha_cierre_estimada' => now()->addDays(20)->toDateString(),
            'estado' => 'abierta',
        ]);

        $oportunidadId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.titulo', 'Nuevo contrato');

        $this->putJson("/api/oportunidades/{$oportunidadId}", [
            'cliente_id' => $cliente->id,
            'titulo' => 'Nuevo contrato',
            'descripcion' => 'Upgrade anual premium',
            'valor_estimado' => 12000,
            'fase' => 'negociacion',
            'probabilidad' => 60,
            'fecha_cierre_estimada' => now()->addDays(30)->toDateString(),
            'estado' => 'abierta',
        ])->assertOk()
            ->assertJsonPath('data.fase', 'negociacion')
            ->assertJsonPath('data.valor_estimado', '12000.00');

        $this->deleteJson("/api/oportunidades/{$oportunidadId}")
            ->assertNoContent();

        $this->assertSoftDeleted('oportunidades', ['id' => $oportunidadId]);
    }

    public function test_it_lists_and_manages_actividades(): void
    {
        $cliente = Cliente::factory()->create(['empresa' => 'Acme Solar']);
        $contacto = Contacto::factory()->create(['cliente_id' => $cliente->id]);
        $oportunidad = Oportunidad::factory()->create(['cliente_id' => $cliente->id]);

        $visible = Actividad::factory()->create([
            'cliente_id' => $cliente->id,
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'tipo' => 'llamada',
            'asunto' => 'Llamada de avance',
            'completada' => false,
        ]);

        Actividad::factory()->create([
            'cliente_id' => $cliente->id,
            'tipo' => 'email',
            'asunto' => 'Email archivado',
            'completada' => true,
        ]);

        $this->getJson('/api/actividades?search=Llamada&tipo=llamada&completada=0')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $visible->id);

        $createResponse = $this->postJson('/api/actividades', [
            'cliente_id' => $cliente->id,
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'tipo' => 'reunion',
            'asunto' => 'Reunion de cierre',
            'descripcion' => 'Preparacion final',
            'fecha_actividad' => now()->addDay()->toIso8601String(),
            'completada' => false,
        ]);

        $actividadId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.asunto', 'Reunion de cierre');

        $this->putJson("/api/actividades/{$actividadId}", [
            'cliente_id' => $cliente->id,
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'tipo' => 'reunion',
            'asunto' => 'Reunion de cierre',
            'descripcion' => 'Preparacion completada',
            'fecha_actividad' => now()->addDays(2)->toIso8601String(),
            'completada' => true,
        ])->assertOk()
            ->assertJsonPath('data.completada', true);

        $this->deleteJson("/api/actividades/{$actividadId}")
            ->assertNoContent();

        $this->assertSoftDeleted('actividades', ['id' => $actividadId]);
    }

    public function test_it_lists_and_manages_tareas(): void
    {
        $cliente = Cliente::factory()->create(['empresa' => 'Acme Solar']);
        $contacto = Contacto::factory()->create(['cliente_id' => $cliente->id]);
        $oportunidad = Oportunidad::factory()->create(['cliente_id' => $cliente->id]);

        $visible = Tarea::factory()->create([
            'cliente_id' => $cliente->id,
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'titulo' => 'Preparar propuesta',
            'prioridad' => 'alta',
            'estado' => 'pendiente',
        ]);

        Tarea::factory()->create([
            'cliente_id' => $cliente->id,
            'titulo' => 'Cerrar expediente',
            'prioridad' => 'baja',
            'estado' => 'completada',
        ]);

        $this->getJson('/api/tareas?search=propuesta&prioridad=alta&estado=pendiente')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $visible->id);

        $createResponse = $this->postJson('/api/tareas', [
            'cliente_id' => $cliente->id,
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'titulo' => 'Enviar contrato',
            'descripcion' => 'Revision legal',
            'prioridad' => 'urgente',
            'estado' => 'pendiente',
            'fecha_vencimiento' => now()->addDays(3)->toIso8601String(),
        ]);

        $tareaId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.titulo', 'Enviar contrato');

        $this->putJson("/api/tareas/{$tareaId}", [
            'cliente_id' => $cliente->id,
            'contacto_id' => $contacto->id,
            'oportunidad_id' => $oportunidad->id,
            'titulo' => 'Enviar contrato',
            'descripcion' => 'Revision legal y comercial',
            'prioridad' => 'alta',
            'estado' => 'en_progreso',
            'fecha_vencimiento' => now()->addDays(5)->toIso8601String(),
        ])->assertOk()
            ->assertJsonPath('data.estado', 'en_progreso');

        $this->deleteJson("/api/tareas/{$tareaId}")
            ->assertNoContent();

        $this->assertSoftDeleted('tareas', ['id' => $tareaId]);
    }
}
