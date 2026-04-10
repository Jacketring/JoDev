<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Cliente;
use App\Models\Contacto;
use App\Models\Oportunidad;
use App\Models\Tarea;
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
                ->with('cliente')
                ->orderByDesc('es_principal')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Contacto $contacto) => [
                    'id' => $contacto->id,
                    'cliente_id' => $contacto->cliente_id,
                    'nombre_completo' => $contacto->nombre_completo,
                    'cargo' => $contacto->cargo,
                    'cliente' => $contacto->cliente?->empresa ?: $contacto->cliente?->nombre_completo,
                ]),
            'oportunidades' => CrmAccess::applyClienteScope(Oportunidad::query(), $user)
                ->with('cliente')
                ->orderByRaw("CASE WHEN estado = 'abierta' THEN 0 ELSE 1 END")
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (Oportunidad $oportunidad) => [
                    'id' => $oportunidad->id,
                    'cliente_id' => $oportunidad->cliente_id,
                    'titulo' => $oportunidad->titulo,
                    'fase' => $oportunidad->fase,
                    'estado' => $oportunidad->estado,
                    'cliente' => $oportunidad->cliente?->empresa ?: $oportunidad->cliente?->nombre_completo,
                ]),
        ]);
    }
}
