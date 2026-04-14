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
        $clienteScope = CrmAccess::applyClienteRecordScope(Cliente::query(), $user);
        $oportunidadScope = CrmAccess::applyClienteScope(Oportunidad::query(), $user);
        $actividadScope = CrmAccess::applyClienteScope(Actividad::query(), $user);
        $tareaScope = CrmAccess::applyClienteScope(Tarea::query(), $user);

        $clientesRecientes = (clone $clienteScope)
            ->latest()
            ->limit(5)
            ->get();
        $oportunidadesRecientes = (clone $oportunidadScope)
            ->with('cliente')
            ->latest()
            ->limit(5)
            ->get();
        $actividadesProximas = (clone $actividadScope)
            ->with(['cliente', 'contacto', 'oportunidad'])
            ->where('completada', false)
            ->where('fecha_actividad', '>=', now())
            ->orderBy('fecha_actividad')
            ->limit(5)
            ->get();
        $tareasVencidas = (clone $tareaScope)
            ->with(['cliente', 'contacto', 'oportunidad'])
            ->whereIn('estado', ['pendiente', 'en_progreso'])
            ->whereNotNull('fecha_vencimiento')
            ->where('fecha_vencimiento', '<', now())
            ->orderBy('fecha_vencimiento')
            ->limit(5)
            ->get();

        return response()->json([
            'metricas' => [
                'clientes_activos' => (clone $clienteScope)
                    ->where('estado', 'activo')
                    ->count(),
                'clientes_totales' => (clone $clienteScope)->count(),
                'clientes_nuevos_30_dias' => (clone $clienteScope)
                    ->where('created_at', '>=', now()->subDays(30))
                    ->count(),
                'oportunidades_abiertas' => (clone $oportunidadScope)
                    ->where('estado', 'abierta')
                    ->count(),
                'valor_pipeline' => (float) ((clone $oportunidadScope)
                    ->where('estado', 'abierta')
                    ->sum('valor_estimado')),
                'tareas_pendientes' => (clone $tareaScope)
                    ->whereIn('estado', ['pendiente', 'en_progreso'])
                    ->count(),
                'actividades_proximas' => (clone $actividadScope)
                    ->where('completada', false)
                    ->where('fecha_actividad', '>=', now())
                    ->count(),
            ],
            'clientes_recientes' => ClienteResource::collection($clientesRecientes)->resolve(),
            'oportunidades_recientes' => OportunidadResource::collection($oportunidadesRecientes)->resolve(),
            'actividades_proximas' => ActividadResource::collection($actividadesProximas)->resolve(),
            'tareas_vencidas' => TareaResource::collection($tareasVencidas)->resolve(),
            'embudo' => $this->buildPipelineByStage($oportunidadScope),
            'distribuciones' => [
                'clientes_estado' => $this->buildDistribution(
                    $clienteScope,
                    'estado',
                    Cliente::ESTADOS,
                ),
                'tareas_estado' => $this->buildDistribution(
                    $tareaScope,
                    'estado',
                    Tarea::ESTADOS,
                ),
            ],
        ]);
    }

    protected function buildDistribution($query, string $column, array $expectedValues): array
    {
        $counts = (clone $query)
            ->selectRaw("{$column}, COUNT(*) as total")
            ->groupBy($column)
            ->pluck('total', $column)
            ->map(fn ($value) => (int) $value);

        $orderedValues = collect(array_merge($expectedValues, $counts->keys()->all()))
            ->filter()
            ->unique()
            ->values();

        return [
            'total' => $counts->sum(),
            'items' => $orderedValues
                ->map(fn (string $value) => [
                    'clave' => $value,
                    'total' => (int) ($counts->get($value) ?? 0),
                ])
                ->values(),
        ];
    }

    protected function buildPipelineByStage($query): array
    {
        return (clone $query)
            ->where('estado', 'abierta')
            ->selectRaw('fase, COUNT(*) as total, COALESCE(SUM(valor_estimado), 0) as valor')
            ->groupBy('fase')
            ->orderByRaw("
                CASE fase
                    WHEN 'nuevo' THEN 1
                    WHEN 'calificado' THEN 2
                    WHEN 'propuesta' THEN 3
                    WHEN 'negociacion' THEN 4
                    WHEN 'ganado' THEN 5
                    WHEN 'perdido' THEN 6
                    ELSE 99
                END
            ")
            ->get()
            ->map(fn ($row) => [
                'fase' => $row->fase,
                'total' => (int) $row->total,
                'valor' => (float) $row->valor,
            ])
            ->values()
            ->all();
    }
}
