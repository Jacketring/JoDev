<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesApiPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOportunidadRequest;
use App\Http\Requests\UpdateOportunidadRequest;
use App\Http\Resources\OportunidadResource;
use App\Models\Oportunidad;
use App\Support\CrmAccess;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OportunidadController extends Controller
{
    use ResolvesApiPagination;

    public function index(Request $request)
    {
        $query = $this->applyArchivedFilter(
            CrmAccess::applyClienteScope(
                Oportunidad::query()->with('cliente'),
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
                $request->filled('fase'),
                fn ($builder) => $builder->where('fase', $request->string('fase'))
            )
            ->when(
                $request->filled('estado'),
                fn ($builder) => $builder->where('estado', $request->string('estado'))
            )
            ->latest();

        return OportunidadResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(StoreOportunidadRequest $request)
    {
        CrmAccess::adminOnly($request->user());

        $oportunidad = Oportunidad::create($request->validated());

        return (new OportunidadResource($oportunidad->load('cliente')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Oportunidad $oportunidad): OportunidadResource
    {
        CrmAccess::ensureCanAccessCliente(request()->user(), $oportunidad->cliente_id);

        $oportunidad->load([
            'cliente',
            'actividades' => fn ($query) => $query->latest('fecha_actividad'),
            'tareas' => fn ($query) => $query->orderBy('fecha_vencimiento'),
        ]);

        return new OportunidadResource($oportunidad);
    }

    public function update(UpdateOportunidadRequest $request, Oportunidad $oportunidad): OportunidadResource
    {
        CrmAccess::adminOnly($request->user());

        $oportunidad->update($request->validated());

        return new OportunidadResource($oportunidad->fresh()->load('cliente'));
    }

    public function destroy(Oportunidad $oportunidad)
    {
        CrmAccess::adminOnly(request()->user());

        $oportunidad->delete();

        return response()->noContent();
    }
}
