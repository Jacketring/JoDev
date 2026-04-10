<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActividadResource;
use App\Http\Resources\ClienteResource;
use App\Http\Resources\OportunidadResource;
use App\Http\Resources\TareaResource;
use App\Models\Actividad;
use App\Models\Cliente;
use App\Models\Oportunidad;
use App\Models\Tarea;
use App\Support\CrmAccess;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $actividadesProximas = CrmAccess::applyClienteScope(Actividad::query(), $user)
            ->with(['cliente', 'contacto', 'oportunidad'])
            ->where('fecha_actividad', '>=', now())
            ->orderBy('fecha_actividad')
            ->limit(5)
            ->get();

        $tareasVencidas = CrmAccess::applyClienteScope(Tarea::query(), $user)
            ->with(['cliente', 'contacto', 'oportunidad'])
            ->whereNotNull('fecha_vencimiento')
            ->where('fecha_vencimiento', '<', now())
            ->where('estado', '!=', 'completada')
            ->orderBy('fecha_vencimiento')
            ->limit(5)
            ->get();

        $clientesRecientes = CrmAccess::applyClienteRecordScope(Cliente::query(), $user)
            ->withCount(['contactos', 'oportunidades'])
            ->latest()
            ->limit(5)
            ->get();

        $oportunidadesRecientes = CrmAccess::applyClienteScope(Oportunidad::query(), $user)
            ->with('cliente')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'metricas' => [
                'clientes_activos' => CrmAccess::applyClienteRecordScope(Cliente::query(), $user)
                    ->where('estado', 'activo')
                    ->count(),
                'oportunidades_abiertas' => CrmAccess::applyClienteScope(Oportunidad::query(), $user)
                    ->where('estado', 'abierta')
                    ->count(),
                'valor_pipeline' => (float) CrmAccess::applyClienteScope(Oportunidad::query(), $user)
                    ->where('estado', 'abierta')
                    ->sum('valor_estimado'),
                'tareas_pendientes' => CrmAccess::applyClienteScope(Tarea::query(), $user)
                    ->whereIn('estado', ['pendiente', 'en_progreso'])
                    ->count(),
                'actividades_proximas' => CrmAccess::applyClienteScope(Actividad::query(), $user)
                    ->where('fecha_actividad', '>=', now())
                    ->count(),
            ],
            'actividades_proximas' => ActividadResource::collection($actividadesProximas)->resolve(),
            'tareas_vencidas' => TareaResource::collection($tareasVencidas)->resolve(),
            'clientes_recientes' => ClienteResource::collection($clientesRecientes)->resolve(),
            'oportunidades_recientes' => OportunidadResource::collection($oportunidadesRecientes)->resolve(),
            'embudo' => CrmAccess::applyClienteScope(Oportunidad::query(), $user)
                ->selectRaw('fase, COUNT(*) as total, COALESCE(SUM(valor_estimado), 0) as valor')
                ->where('estado', 'abierta')
                ->groupBy('fase')
                ->get()
                ->map(fn ($item) => [
                    'fase' => $item->fase,
                    'total' => (int) $item->total,
                    'valor' => (float) $item->valor,
                ])
                ->values(),
        ]);
    }
}
