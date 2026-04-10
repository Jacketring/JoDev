<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait ResolvesApiPagination
{
    protected function perPage(Request $request): int
    {
        return min(max($request->integer('per_page', 10), 1), 50);
    }

    protected function applyArchivedFilter(Builder $query, Request $request): Builder
    {
        return $request->boolean('archived') ? $query->onlyTrashed() : $query;
    }
}
