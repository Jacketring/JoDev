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
                Contacto::query()->with('cliente'),
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
            ->orderByDesc('es_principal')
            ->orderBy('nombre');

        return ContactoResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(StoreContactoRequest $request)
    {
        $payload = CrmAccess::forceOwnCliente($request->user(), $request->validated());
        CrmAccess::ensureCanAccessCliente($request->user(), $payload['cliente_id']);

        $contacto = Contacto::create($payload);
        $this->syncPrimaryContact($contacto, (bool) ($request->validated()['es_principal'] ?? false));

        return (new ContactoResource($contacto->fresh()->load('cliente')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Contacto $contacto): ContactoResource
    {
        CrmAccess::ensureCanAccessCliente(request()->user(), $contacto->cliente_id);

        $contacto->load([
            'cliente',
            'actividades' => fn ($query) => $query->latest('fecha_actividad'),
            'tareas' => fn ($query) => $query->orderBy('fecha_vencimiento'),
        ]);

        return new ContactoResource($contacto);
    }

    public function update(UpdateContactoRequest $request, Contacto $contacto): ContactoResource
    {
        CrmAccess::ensureCanAccessCliente($request->user(), $contacto->cliente_id);

        $payload = CrmAccess::forceOwnCliente($request->user(), $request->validated());
        $contacto->update($payload);
        $this->syncPrimaryContact($contacto, (bool) ($request->validated()['es_principal'] ?? false));

        return new ContactoResource($contacto->fresh()->load('cliente'));
    }

    public function destroy(Contacto $contacto)
    {
        CrmAccess::ensureCanAccessCliente(request()->user(), $contacto->cliente_id);

        $contacto->delete();

        return response()->noContent();
    }

    private function syncPrimaryContact(Contacto $contacto, bool $requestedPrimary): void
    {
        $hasPrimary = Contacto::query()
            ->where('cliente_id', $contacto->cliente_id)
            ->whereKeyNot($contacto->id)
            ->where('es_principal', true)
            ->exists();

        if (! $requestedPrimary && $hasPrimary) {
            return;
        }

        Contacto::query()
            ->where('cliente_id', $contacto->cliente_id)
            ->whereKeyNot($contacto->id)
            ->update(['es_principal' => false]);

        if (! $contacto->es_principal) {
            $contacto->forceFill(['es_principal' => true])->save();
        }
    }
}
