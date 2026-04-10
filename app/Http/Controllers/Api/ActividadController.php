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
use Illuminate\Validation\ValidationException;

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
            ->when(
                $request->filled('fecha_desde'),
                fn ($builder) => $builder->whereDate('fecha_actividad', '>=', $request->date('fecha_desde'))
            )
            ->when(
                $request->filled('fecha_hasta'),
                fn ($builder) => $builder->whereDate('fecha_actividad', '<=', $request->date('fecha_hasta'))
            )
            ->latest('fecha_actividad');

        return ActividadResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(StoreActividadRequest $request)
    {
        CrmAccess::adminOnly($request->user());

        $actividad = Actividad::create($this->normalizeRelationships($request->validated()));

        return (new ActividadResource($actividad->load(['cliente', 'contacto', 'oportunidad'])))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Actividad $actividad): ActividadResource
    {
        CrmAccess::ensureCanAccessCliente(request()->user(), $actividad->cliente_id);

        return new ActividadResource($actividad->load(['cliente', 'contacto', 'oportunidad']));
    }

    public function update(UpdateActividadRequest $request, Actividad $actividad): ActividadResource
    {
        CrmAccess::adminOnly($request->user());

        $actividad->update($this->normalizeRelationships($request->validated()));

        return new ActividadResource($actividad->fresh()->load(['cliente', 'contacto', 'oportunidad']));
    }

    public function destroy(Actividad $actividad)
    {
        CrmAccess::adminOnly(request()->user());

        $actividad->delete();

        return response()->noContent();
    }

    private function normalizeRelationships(array $data): array
    {
        $contacto = isset($data['contacto_id']) ? Contacto::find($data['contacto_id']) : null;
        $oportunidad = isset($data['oportunidad_id']) ? Oportunidad::find($data['oportunidad_id']) : null;
        $clienteId = $data['cliente_id'] ?? null;

        if ($contacto && $clienteId && $contacto->cliente_id !== $clienteId) {
            throw ValidationException::withMessages([
                'contacto_id' => 'El contacto no pertenece al cliente seleccionado.',
            ]);
        }

        if ($oportunidad && $clienteId && $oportunidad->cliente_id !== $clienteId) {
            throw ValidationException::withMessages([
                'oportunidad_id' => 'La oportunidad no pertenece al cliente seleccionado.',
            ]);
        }

        if ($contacto && $oportunidad && $contacto->cliente_id !== $oportunidad->cliente_id) {
            throw ValidationException::withMessages([
                'oportunidad_id' => 'La oportunidad y el contacto deben pertenecer al mismo cliente.',
            ]);
        }

        $data['cliente_id'] = $clienteId ?? $oportunidad?->cliente_id ?? $contacto?->cliente_id;

        return $data;
    }
}
