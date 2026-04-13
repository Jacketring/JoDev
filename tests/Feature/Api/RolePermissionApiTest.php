<?php

namespace Tests\Feature\Api;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_manage_users_and_assign_client_accounts(): void
    {
        $admin = User::factory()->create([
            'role' => 'administrador',
        ]);
        $cliente = Cliente::factory()->create([
            'empresa' => 'Acme Cliente',
        ]);

        $this->actingAs($admin);

        $createResponse = $this->postJson('/api/usuarios', [
            'name' => 'Cliente Portal',
            'email' => 'portal@example.com',
            'password' => 'Portal2026!',
            'role' => 'cliente',
            'cliente_id' => $cliente->id,
        ]);

        $userId = $createResponse->json('data.id');

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.role', 'cliente')
            ->assertJsonPath('data.cliente_id', $cliente->id);

        $this->getJson('/api/usuarios?role=cliente')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.email', 'portal@example.com');

        $this->putJson("/api/usuarios/{$userId}", [
            'name' => 'Cliente Portal Editado',
            'email' => 'portal@example.com',
            'password' => null,
            'role' => 'cliente',
            'cliente_id' => $cliente->id,
        ])->assertOk()
            ->assertJsonPath('data.name', 'Cliente Portal Editado');
    }

    public function test_client_cannot_access_user_management_endpoints(): void
    {
        $cliente = Cliente::factory()->create();
        $user = User::factory()->create([
            'role' => 'cliente',
            'cliente_id' => $cliente->id,
        ]);

        $this->actingAs($user);

        $this->getJson('/api/usuarios')->assertForbidden();
        $this->postJson('/api/usuarios', [
            'name' => 'Otro',
            'email' => 'otro@example.com',
            'password' => 'Portal2026!',
            'role' => 'cliente',
            'cliente_id' => $cliente->id,
        ])->assertForbidden();
    }

    public function test_client_only_sees_own_dashboard_and_can_only_update_safe_fields_on_own_company(): void
    {
        $clientePropio = Cliente::factory()->create([
            'empresa' => 'Cliente JoDev',
            'estado' => 'activo',
            'telefono' => '911000111',
        ]);
        $clienteAjeno = Cliente::factory()->create([
            'empresa' => 'Otro Cliente',
            'estado' => 'inactivo',
        ]);

        $user = User::factory()->create([
            'role' => 'cliente',
            'cliente_id' => $clientePropio->id,
        ]);

        $this->actingAs($user);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('metricas.clientes_activos', 1)
            ->assertJsonPath('metricas.clientes_totales', 1)
            ->assertJsonPath('metricas.clientes_nuevos_30_dias', 1)
            ->assertJsonPath('distribuciones.clientes_estado.total', 1);

        $this->putJson("/api/clientes/{$clientePropio->id}", [
            'nombre' => $clientePropio->nombre,
            'apellidos' => $clientePropio->apellidos,
            'empresa' => 'Cliente JoDev Renovado',
            'email' => $clientePropio->email,
            'telefono' => '933444555',
            'movil' => $clientePropio->movil,
            'direccion' => $clientePropio->direccion,
            'ciudad' => $clientePropio->ciudad,
            'provincia' => $clientePropio->provincia,
            'codigo_postal' => $clientePropio->codigo_postal,
            'pais' => $clientePropio->pais,
            'web' => $clientePropio->web,
            'origen' => 'evento',
            'estado' => 'inactivo',
            'notas' => 'Actualizado por cliente',
        ])->assertOk()
            ->assertJsonPath('data.empresa', 'Cliente JoDev Renovado')
            ->assertJsonPath('data.telefono', '933444555')
            ->assertJsonPath('data.estado', 'activo')
            ->assertJsonPath('data.origen', $clientePropio->origen);

        $this->postJson('/api/clientes', [
            'nombre' => 'No permitido',
            'estado' => 'activo',
        ])->assertForbidden();

        $this->getJson("/api/clientes/{$clienteAjeno->id}")
            ->assertForbidden();
    }
}
