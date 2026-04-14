<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Cliente;
use App\Models\Contacto;
use App\Models\Oportunidad;
use App\Models\Tarea;
use App\Models\User;
use App\Support\CrmAccess;
use Illuminate\Http\Request;

class OpcionesController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'catalogos' => [
                'cliente_estados' => Cliente::ESTADOS,
                'oportunidad_fases' => Oportunidad::FASES,
                'oportunidad_estados' => Oportunidad::ESTADOS,
                'actividad_tipos' => Actividad::TIPOS,
                'tarea_prioridades' => Tarea::PRIORIDADES,
                'tarea_estados' => Tarea::ESTADOS,
            ],
            'clientes' => CrmAccess::applyClienteRecordScope(Cliente::query(), $user)
                ->orderBy('empresa')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Cliente $cliente) => [
                    'id' => $cliente->id,
                    'nombre_completo' => $cliente->nombre_completo,
                    'empresa' => $cliente->empresa,
                    'estado' => $cliente->estado,
                ]),
            'contactos' => CrmAccess::applyClienteScope(Contacto::query(), $user)
                ->orderBy('nombre')
                ->orderBy('apellidos')
                ->get()
                ->map(fn (Contacto $contacto) => [
                    'id' => $contacto->id,
                    'cliente_id' => $contacto->cliente_id,
                    'nombre_completo' => $contacto->nombre_completo,
                    'cargo' => $contacto->cargo,
                    'email' => $contacto->email,
                    'es_principal' => $contacto->es_principal,
                ]),
            'oportunidades' => CrmAccess::applyClienteScope(Oportunidad::query(), $user)
                ->orderBy('titulo')
                ->get()
                ->map(fn (Oportunidad $oportunidad) => [
                    'id' => $oportunidad->id,
                    'cliente_id' => $oportunidad->cliente_id,
                    'titulo' => $oportunidad->titulo,
                    'fase' => $oportunidad->fase,
                    'estado' => $oportunidad->estado,
                    'valor_estimado' => $oportunidad->valor_estimado,
                ]),
            'usuarios_asignables' => $user->isAdmin()
                ? User::query()
                    ->with('cliente')
                    ->orderBy('name')
                    ->get()
                    ->map(fn (User $assignableUser) => [
                        'id' => $assignableUser->id,
                        'name' => $assignableUser->name,
                        'email' => $assignableUser->email,
                        'role' => $assignableUser->role,
                        'cliente_id' => $assignableUser->cliente_id,
                        'cliente' => $assignableUser->cliente ? [
                            'id' => $assignableUser->cliente->id,
                            'empresa' => $assignableUser->cliente->empresa,
                            'nombre_completo' => $assignableUser->cliente->nombre_completo,
                        ] : null,
                    ])
                : [],
        ]);
    }
}
