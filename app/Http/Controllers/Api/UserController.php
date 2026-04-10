<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesApiPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\CrmAccess;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class UserController extends Controller
{
    use ResolvesApiPagination;

    public function index(Request $request)
    {
        CrmAccess::adminOnly($request->user());

        $query = User::query()
            ->with('cliente')
            ->when(
                $request->filled('search'),
                function ($builder) use ($request) {
                    $term = '%'.trim((string) $request->string('search')).'%';

                    $builder->where(function ($nested) use ($term) {
                        $nested
                            ->where('name', 'like', $term)
                            ->orWhere('email', 'like', $term);
                    });
                }
            )
            ->when(
                $request->filled('role'),
                fn ($builder) => $builder->where('role', $request->string('role'))
            )
            ->latest();

        return UserResource::collection(
            $query->paginate($this->perPage($request))->withQueryString()
        );
    }

    public function store(StoreUserRequest $request)
    {
        CrmAccess::adminOnly($request->user());

        $payload = $this->normalizePayload($request->validated());
        $user = User::query()->create($payload)->load('cliente');

        return (new UserResource($user))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(User $user): UserResource
    {
        CrmAccess::adminOnly(request()->user());

        return new UserResource($user->load('cliente'));
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        CrmAccess::adminOnly($request->user());

        $payload = $this->normalizePayload($request->validated(), false);
        $user->update($payload);

        return new UserResource($user->fresh()->load('cliente'));
    }

    private function normalizePayload(array $data, bool $creating = true): array
    {
        if (($data['role'] ?? null) !== 'cliente') {
            $data['cliente_id'] = null;
        }

        if (! $creating && empty($data['password'])) {
            unset($data['password']);
        }

        return $data;
    }
}
