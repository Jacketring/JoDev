<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesApiPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClienteRequest;
use App\Http\Requests\UpdateClienteRequest;
use App\Http\Resources\ClienteResource;
use App\Models\Cliente;
use App\Support\CrmAccess;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ClienteController extends Controller
{
    use ResolvesApiPagination;

    public function index(Request $request)
    {
        $query = $this->applyArchivedFilter(
            CrmAccess::applyClienteRecordScope(
                Cliente::query()->withCount(['contactos', 'oportunidades']),
                $request->user()
            ),
            $request
        );

        $query
            ->search((string) $request->string('search'))
            ->when(
                $request->filled('estado'),
                fn ($builder) => $builder->where('estado', $request->string('estado'))
            )
            ->latest();

        return ClienteResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(StoreClienteRequest $request)
    {
        CrmAccess::adminOnly($request->user());

        $cliente = Cliente::create($request->validated())->loadCount(['contactos', 'oportunidades']);

        return (new ClienteResource($cliente))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Cliente $cliente): ClienteResource
    {
        CrmAccess::ensureCanAccessCliente(request()->user(), $cliente->id);

        $cliente
            ->loadCount(['contactos', 'oportunidades'])
            ->load([
                'contactos' => fn ($query) => $query->orderByDesc('es_principal')->orderBy('nombre'),
                'oportunidades' => fn ($query) => $query->latest(),
                'actividades' => fn ($query) => $query->latest('fecha_actividad'),
                'tareas' => fn ($query) => $query->orderBy('fecha_vencimiento'),
            ]);

        return new ClienteResource($cliente);
    }

    public function update(UpdateClienteRequest $request, Cliente $cliente): ClienteResource
    {
        CrmAccess::ensureCanAccessCliente($request->user(), $cliente->id);

        $payload = $request->user()->isAdmin()
            ? $request->validated()
            : CrmAccess::sanitizeClientPayload($request->validated());

        $cliente->update($payload);

        return new ClienteResource(
            $cliente->fresh()->loadCount(['contactos', 'oportunidades'])
        );
    }

    public function destroy(Cliente $cliente)
    {
        CrmAccess::adminOnly(request()->user());

        $cliente->delete();

        return response()->noContent();
    }
}
