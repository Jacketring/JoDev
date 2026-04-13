<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClienteResource;
use App\Models\Cliente;
use App\Support\CrmAccess;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $clienteScope = CrmAccess::applyClienteRecordScope(Cliente::query(), $user);

        $clientesRecientes = (clone $clienteScope)
            ->latest()
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
            ],
            'clientes_recientes' => ClienteResource::collection($clientesRecientes)->resolve(),
            'distribuciones' => [
                'clientes_estado' => $this->buildDistribution(
                    $clienteScope,
                    'estado',
                    Cliente::ESTADOS,
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
}
