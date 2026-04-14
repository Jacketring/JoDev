<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesApiPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactoRequest;
use App\Http\Requests\UpdateContactoRequest;
use App\Http\Resources\ContactoResource;
use App\Models\Contacto;
use App\Support\CrmAccess;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ContactoController extends Controller
{
    use ResolvesApiPagination;

    public function index(Request $request)
    {
        $query = $this->applyArchivedFilter(
            CrmAccess::applyClienteScope(
                Contacto::query()->with('cliente')->withCount(['actividades', 'tareas']),
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
                $request->filled('es_principal'),
                fn ($builder) => $builder->where('es_principal', $request->boolean('es_principal'))
            )
            ->latest();

        return ContactoResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(StoreContactoRequest $request)
    {
        CrmAccess::adminOnly($request->user());

        $contacto = Contacto::create($request->validated());
        $contacto->load('cliente');

        return (new ContactoResource($contacto))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Contacto $contacto): ContactoResource
    {
        CrmAccess::ensureCanAccessScopedCliente(request()->user(), $contacto->cliente_id);

        $contacto->loadCount(['actividades', 'tareas'])
            ->loadMissing([
                'cliente',
                'actividades' => fn ($query) => $query->latest('fecha_actividad'),
                'tareas' => fn ($query) => $query->latest('fecha_vencimiento'),
            ]);

        return new ContactoResource($contacto);
    }

    public function update(UpdateContactoRequest $request, Contacto $contacto): ContactoResource
    {
        CrmAccess::adminOnly($request->user());
        CrmAccess::ensureCanAccessScopedCliente($request->user(), $contacto->cliente_id);

        $contacto->update($request->validated());

        return new ContactoResource($contacto->fresh()->load('cliente'));
    }

    public function destroy(Contacto $contacto)
    {
        CrmAccess::adminOnly(request()->user());
        CrmAccess::ensureCanAccessScopedCliente(request()->user(), $contacto->cliente_id);

        $contacto->delete();

        return response()->noContent();
    }
}
