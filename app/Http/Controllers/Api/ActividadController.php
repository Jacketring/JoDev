<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesApiPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActividadRequest;
use App\Http\Requests\UpdateActividadRequest;
use App\Http\Resources\ActividadResource;
use App\Models\Actividad;
use App\Models\Contacto;
use App\Models\Oportunidad;
use App\Support\CrmAccess;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ActividadController extends Controller
{
    use ResolvesApiPagination;

    public function index(Request $request)
    {
        $query = $this->applyArchivedFilter(
            CrmAccess::applyClienteScope(
                Actividad::query()->with(['cliente', 'contacto', 'oportunidad']),
                $request->user()
            ),
            $request
        );

        $query
            ->search((string) $request->string('search'))
            ->when(
                $request->filled('cliente_id'),
                fn ($builder) => $builder->where('cliente_id', $request->integer('cliente_id'))
            )
            ->when(
                $request->filled('tipo'),
                fn ($builder) => $builder->where('tipo', $request->string('tipo'))
            )
            ->when(
                $request->filled('completada'),
                fn ($builder) => $builder->where('completada', $request->boolean('completada'))
            )
            ->latest('fecha_actividad');

        return ActividadResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(StoreActividadRequest $request)
    {
        CrmAccess::adminOnly($request->user());

        $actividad = Actividad::create($this->normalizePayload($request->validated()));
        $actividad->load(['cliente', 'contacto', 'oportunidad']);

        return (new ActividadResource($actividad))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Actividad $actividad): ActividadResource
    {
        CrmAccess::ensureCanAccessScopedCliente(request()->user(), $actividad->cliente_id);

        return new ActividadResource(
            $actividad->loadMissing(['cliente', 'contacto', 'oportunidad'])
        );
    }

    public function update(UpdateActividadRequest $request, Actividad $actividad): ActividadResource
    {
        CrmAccess::adminOnly($request->user());
        CrmAccess::ensureCanAccessScopedCliente($request->user(), $actividad->cliente_id);

        $actividad->update($request->validated());

        return new ActividadResource($actividad->fresh()->load(['cliente', 'contacto', 'oportunidad']));
    }

    public function destroy(Actividad $actividad)
    {
        CrmAccess::adminOnly(request()->user());
        CrmAccess::ensureCanAccessScopedCliente(request()->user(), $actividad->cliente_id);

        $actividad->delete();

        return response()->noContent();
    }

    protected function normalizePayload(array $data): array
    {
        if (empty($data['cliente_id']) && ! empty($data['contacto_id'])) {
            $data['cliente_id'] = Contacto::query()->whereKey($data['contacto_id'])->value('cliente_id');
        }

        if (empty($data['cliente_id']) && ! empty($data['oportunidad_id'])) {
            $data['cliente_id'] = Oportunidad::query()->whereKey($data['oportunidad_id'])->value('cliente_id');
        }

        $data['tipo'] = $data['tipo'] ?? 'nota';
        $data['fecha_actividad'] = $data['fecha_actividad'] ?? now();
        $data['completada'] = (bool) ($data['completada'] ?? false);

        return $data;
    }
}
