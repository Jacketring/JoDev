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
            ->latest('fecha_vencimiento');

        return TareaResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(StoreTareaRequest $request)
    {
        CrmAccess::adminOnly($request->user());

        $tarea = Tarea::create($request->validated());
        $tarea->load(['cliente', 'contacto', 'oportunidad']);

        return (new TareaResource($tarea))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Tarea $tarea): TareaResource
    {
        CrmAccess::ensureCanAccessScopedCliente(request()->user(), $tarea->cliente_id);

        return new TareaResource(
            $tarea->loadMissing(['cliente', 'contacto', 'oportunidad'])
        );
    }

    public function update(UpdateTareaRequest $request, Tarea $tarea): TareaResource
    {
        CrmAccess::adminOnly($request->user());
        CrmAccess::ensureCanAccessScopedCliente($request->user(), $tarea->cliente_id);

        $tarea->update($request->validated());

        return new TareaResource($tarea->fresh()->load(['cliente', 'contacto', 'oportunidad']));
    }

    public function destroy(Tarea $tarea)
    {
        CrmAccess::adminOnly(request()->user());
        CrmAccess::ensureCanAccessScopedCliente(request()->user(), $tarea->cliente_id);

        $tarea->delete();

        return response()->noContent();
    }
}
