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

class GlobalSearchController extends Controller
{
    public function __invoke(Request $request)
    {
        $term = trim((string) $request->string('q'));
        $limit = min(max($request->integer('limit', 5), 1), 10);

        if ($term === '') {
            return response()->json([
                'query' => $term,
                'total' => 0,
                'results' => [],
            ]);
        }

        $user = $request->user();

        $results = [
            $this->searchClientes($user, $term, $limit),
            $this->searchContactos($user, $term, $limit),
            $this->searchOportunidades($user, $term, $limit),
            $this->searchActividades($user, $term, $limit),
            $this->searchTareas($user, $term, $limit),
        ];

        $sections = array_values(array_filter($results, fn (array $section) => $section['items'] !== []));

        return response()->json([
            'query' => $term,
            'total' => collect($sections)->sum(fn (array $section) => count($section['items'])),
            'results' => $sections,
        ]);
    }

    protected function searchClientes(User $user, string $term, int $limit): array
    {
        $items = CrmAccess::applyClienteRecordScope(Cliente::query(), $user)
            ->search($term)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Cliente $cliente) => [
                'id' => $cliente->id,
                'entity' => 'clientes',
                'title' => $cliente->empresa ?: $cliente->nombre_completo,
                'subtitle' => $this->joinParts([$cliente->nombre_completo, $cliente->email]),
                'meta' => ucfirst($cliente->estado),
                'url' => $this->buildUrl('clientes', $term, $cliente->id),
            ])
            ->values()
            ->all();

        return [
            'entity' => 'clientes',
            'label' => 'Clientes',
            'items' => $items,
        ];
    }

    protected function searchContactos(User $user, string $term, int $limit): array
    {
        $items = CrmAccess::applyClienteScope(Contacto::query()->with('cliente'), $user)
            ->search($term)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Contacto $contacto) => [
                'id' => $contacto->id,
                'entity' => 'contactos',
                'title' => $contacto->nombre_completo,
                'subtitle' => $this->joinParts([$contacto->cliente?->empresa, $contacto->cargo ?: $contacto->email]),
                'meta' => $contacto->es_principal ? 'Principal' : 'Contacto',
                'url' => $this->buildUrl('contactos', $term, $contacto->id),
            ])
            ->values()
            ->all();

        return [
            'entity' => 'contactos',
            'label' => 'Contactos',
            'items' => $items,
        ];
    }

    protected function searchOportunidades(User $user, string $term, int $limit): array
    {
        $items = CrmAccess::applyClienteScope(Oportunidad::query()->with('cliente'), $user)
            ->search($term)
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Oportunidad $oportunidad) => [
                'id' => $oportunidad->id,
                'entity' => 'oportunidades',
                'title' => $oportunidad->titulo,
                'subtitle' => $this->joinParts([$oportunidad->cliente?->empresa, ucfirst($oportunidad->fase)]),
                'meta' => ucfirst($oportunidad->estado),
                'url' => $this->buildUrl('oportunidades', $term, $oportunidad->id),
            ])
            ->values()
            ->all();

        return [
            'entity' => 'oportunidades',
            'label' => 'Oportunidades',
            'items' => $items,
        ];
    }

    protected function searchActividades(User $user, string $term, int $limit): array
    {
        $items = CrmAccess::applyClienteScope(
            Actividad::query()->with(['cliente', 'contacto', 'oportunidad']),
            $user
        )
            ->search($term)
            ->latest('fecha_actividad')
            ->limit($limit)
            ->get()
            ->map(fn (Actividad $actividad) => [
                'id' => $actividad->id,
                'entity' => 'actividades',
                'title' => $actividad->asunto,
                'subtitle' => $this->joinParts([
                    $actividad->cliente?->empresa,
                    $actividad->contacto?->nombre_completo ?: $actividad->oportunidad?->titulo,
                ]),
                'meta' => ucfirst($actividad->tipo),
                'url' => $this->buildUrl('actividades', $term, $actividad->id),
            ])
            ->values()
            ->all();

        return [
            'entity' => 'actividades',
            'label' => 'Actividades',
            'items' => $items,
        ];
    }

    protected function searchTareas(User $user, string $term, int $limit): array
    {
        $items = CrmAccess::applyClienteScope(
            Tarea::query()->with(['cliente', 'contacto', 'oportunidad']),
            $user
        )
            ->search($term)
            ->latest('fecha_vencimiento')
            ->limit($limit)
            ->get()
            ->map(fn (Tarea $tarea) => [
                'id' => $tarea->id,
                'entity' => 'tareas',
                'title' => $tarea->titulo,
                'subtitle' => $this->joinParts([
                    $tarea->cliente?->empresa,
                    $tarea->contacto?->nombre_completo ?: $tarea->oportunidad?->titulo,
                ]),
                'meta' => ucfirst(str_replace('_', ' ', $tarea->estado)),
                'url' => $this->buildUrl('tareas', $term, $tarea->id),
            ])
            ->values()
            ->all();

        return [
            'entity' => 'tareas',
            'label' => 'Tareas',
            'items' => $items,
        ];
    }

    protected function buildUrl(string $entity, string $term, int $recordId): string
    {
        return sprintf('/%s?search=%s&record=%d', $entity, rawurlencode($term), $recordId);
    }

    protected function joinParts(array $parts): string
    {
        return implode(' / ', array_values(array_filter($parts)));
    }
}
