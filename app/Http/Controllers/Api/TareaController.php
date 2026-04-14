<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesApiPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTareaRequest;
use App\Http\Requests\UpdateTareaRequest;
use App\Http\Resources\TareaResource;
use App\Models\Tarea;
use App\Support\CrmAccess;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TareaController extends Controller
{
    use ResolvesApiPagination;

    public function index(Request $request)
    {
        CrmAccess::adminOnly($request->user());

        $query = $this->applyArchivedFilter(
            Tarea::query()->with(['assignedUser']),
            $request
        );

        $query
            ->search((string) $request->string('search'))
            ->when(
                $request->filled('prioridad'),
                fn ($builder) => $builder->where('prioridad', $request->string('prioridad'))
            )
            ->when(
                $request->filled('estado'),
                fn ($builder) => $builder->where('estado', $request->string('estado'))
            )
            ->when(
                $request->filled('assigned_user_id'),
                fn ($builder) => $builder->where('assigned_user_id', $request->integer('assigned_user_id'))
            )
            ->latest('fecha_vencimiento');

        return TareaResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(StoreTareaRequest $request)
    {
        CrmAccess::adminOnly($request->user());

        $tarea = Tarea::create($this->normalizePayload($request->validated()));
        $tarea->load(['assignedUser']);

        return (new TareaResource($tarea))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Tarea $tarea): TareaResource
    {
        CrmAccess::adminOnly(request()->user());

        return new TareaResource(
            $tarea->loadMissing(['assignedUser'])
        );
    }

    public function update(UpdateTareaRequest $request, Tarea $tarea): TareaResource
    {
        CrmAccess::adminOnly($request->user());

        $tarea->update($this->normalizePayload($request->validated()));

        return new TareaResource($tarea->fresh()->load(['assignedUser']));
    }

    public function destroy(Tarea $tarea)
    {
        CrmAccess::adminOnly(request()->user());

        $tarea->delete();

        return response()->noContent();
    }

    protected function normalizePayload(array $data): array
    {
        $data['cliente_id'] = null;
        $data['contacto_id'] = null;
        $data['oportunidad_id'] = null;
        $data['prioridad'] = $data['prioridad'] ?? 'media';
        $data['estado'] = $data['estado'] ?? 'pendiente';

        return $data;
    }
}
