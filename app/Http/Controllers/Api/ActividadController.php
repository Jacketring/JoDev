<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesApiPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreActividadRequest;
use App\Http\Requests\UpdateActividadRequest;
use App\Http\Resources\ActividadResource;
use App\Models\Actividad;
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
                Actividad::query()->with(['assignedUser']),
                $request->user()
            ),
            $request
        );

        $query
            ->search((string) $request->string('search'))
            ->when(
                $request->filled('tipo'),
                fn ($builder) => $builder->where('tipo', $request->string('tipo'))
            )
            ->when(
                $request->filled('completada'),
                fn ($builder) => $builder->where('completada', $request->boolean('completada'))
            )
            ->when(
                $request->filled('assigned_user_id'),
                fn ($builder) => $builder->where('assigned_user_id', $request->integer('assigned_user_id'))
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
        $actividad->load(['assignedUser']);

        return (new ActividadResource($actividad))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Actividad $actividad): ActividadResource
    {
        return new ActividadResource(
            $actividad->loadMissing(['assignedUser'])
        );
    }

    public function update(UpdateActividadRequest $request, Actividad $actividad): ActividadResource
    {
        CrmAccess::adminOnly($request->user());

        $actividad->update($this->normalizePayload($request->validated()));

        return new ActividadResource($actividad->fresh()->load(['assignedUser']));
    }

    public function destroy(Actividad $actividad)
    {
        CrmAccess::adminOnly(request()->user());

        $actividad->delete();

        return response()->noContent();
    }

    protected function normalizePayload(array $data): array
    {
        $data['cliente_id'] = null;
        $data['contacto_id'] = null;
        $data['oportunidad_id'] = null;

        $data['tipo'] = $data['tipo'] ?? 'nota';
        $data['fecha_actividad'] = $data['fecha_actividad'] ?? now();
        $data['completada'] = (bool) ($data['completada'] ?? false);

        return $data;
    }
}
