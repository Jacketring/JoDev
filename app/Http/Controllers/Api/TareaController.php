<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesApiPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTareaRequest;
use App\Http\Requests\UpdateTareaRequest;
use App\Http\Resources\TareaResource;
use App\Models\Contacto;
use App\Models\Oportunidad;
use App\Models\Tarea;
use App\Support\CrmAccess;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class TareaController extends Controller
{
    use ResolvesApiPagination;

    public function index(Request $request)
    {
        $query = $this->applyArchivedFilter(
            CrmAccess::applyClienteScope(
                Tarea::query()->with(['cliente', 'contacto', 'oportunidad']),
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
                $request->filled('prioridad'),
                fn ($builder) => $builder->where('prioridad', $request->string('prioridad'))
            )
            ->when(
                $request->filled('estado'),
                fn ($builder) => $builder->where('estado', $request->string('estado'))
            )
            ->when(
                $request->boolean('vencidas'),
                fn ($builder) => $builder
                    ->whereNotNull('fecha_vencimiento')
                    ->where('fecha_vencimiento', '<', now())
                    ->where('estado', '!=', 'completada')
            )
            ->orderBy('fecha_vencimiento')
            ->latest();

        return TareaResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(StoreTareaRequest $request)
    {
        CrmAccess::adminOnly($request->user());

        $tarea = Tarea::create($this->normalizeRelationships($request->validated()));

        return (new TareaResource($tarea->load(['cliente', 'contacto', 'oportunidad'])))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Tarea $tarea): TareaResource
    {
        CrmAccess::ensureCanAccessCliente(request()->user(), $tarea->cliente_id);

        return new TareaResource($tarea->load(['cliente', 'contacto', 'oportunidad']));
    }

    public function update(UpdateTareaRequest $request, Tarea $tarea): TareaResource
    {
        CrmAccess::adminOnly($request->user());

        $tarea->update($this->normalizeRelationships($request->validated()));

        return new TareaResource($tarea->fresh()->load(['cliente', 'contacto', 'oportunidad']));
    }

    public function destroy(Tarea $tarea)
    {
        CrmAccess::adminOnly(request()->user());

        $tarea->delete();

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
