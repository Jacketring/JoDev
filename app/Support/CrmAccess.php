<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class CrmAccess
{
    public const CLIENTE_EDITABLE_FIELDS = [
        'empresa',
        'email',
        'telefono',
        'movil',
        'direccion',
        'ciudad',
        'provincia',
        'codigo_postal',
        'pais',
        'web',
        'notas',
    ];

    public static function adminOnly(User $user): void
    {
        abort_unless($user->isAdmin(), 403, 'No tienes permisos para esta accion.');
    }

    public static function linkedClienteId(User $user): int
    {
        abort_unless($user->cliente_id, 403, 'La cuenta cliente no tiene una empresa vinculada.');

        return (int) $user->cliente_id;
    }

    public static function ensureCanAccessCliente(User $user, int|string|null $clienteId): void
    {
        if ($user->isAdmin()) {
            return;
        }

        abort_unless(
            $clienteId !== null && (int) $clienteId === self::linkedClienteId($user),
            403,
            'No tienes acceso a este registro.',
        );
    }

    public static function ensureCanAccessScopedCliente(User $user, int|string|null $clienteId): void
    {
        if ($user->isAdmin()) {
            return;
        }

        abort_unless(
            $clienteId !== null && (int) $clienteId === self::linkedClienteId($user),
            403,
            'No tienes acceso a este registro.',
        );
    }

    public static function applyClienteScope(Builder $query, User $user, string $column = 'cliente_id'): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where($column, self::linkedClienteId($user));
    }

    public static function applyClienteRecordScope(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->whereKey(self::linkedClienteId($user));
    }

    public static function forceOwnCliente(User $user, array $data): array
    {
        if ($user->isAdmin()) {
            return $data;
        }

        $data['cliente_id'] = self::linkedClienteId($user);

        return $data;
    }

    public static function sanitizeClientPayload(array $data): array
    {
        return array_intersect_key($data, array_flip(self::CLIENTE_EDITABLE_FIELDS));
    }
}
