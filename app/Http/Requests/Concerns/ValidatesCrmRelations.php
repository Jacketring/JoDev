<?php

namespace App\Http\Requests\Concerns;

use Closure;
use Illuminate\Database\Query\Builder;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

trait ValidatesCrmRelations
{
    protected function activeExists(string $table): Exists
    {
        return Rule::exists($table, 'id')->where(fn (Builder $query) => $query->whereNull('deleted_at'));
    }

    protected function ensureBelongsToCliente(
        ?int $clienteId,
        ?int $recordId,
        string $modelClass,
        string $label,
        Closure $fail,
    ): void {
        if (! $clienteId || ! $recordId) {
            return;
        }

        $relatedClienteId = $modelClass::query()->whereKey($recordId)->value('cliente_id');

        if ($relatedClienteId !== null && (int) $relatedClienteId !== $clienteId) {
            $fail("El {$label} seleccionado no pertenece al cliente indicado.");
        }
    }
}
