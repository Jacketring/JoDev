<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Oportunidad extends Model
{
    use HasFactory, SoftDeletes;

    public const FASES = [
        'nuevo',
        'calificado',
        'propuesta',
        'negociacion',
        'ganado',
        'perdido',
    ];

    public const ESTADOS = [
        'abierta',
        'ganada',
        'perdida',
        'pausada',
    ];

    protected $table = 'oportunidades';

    protected $fillable = [
        'cliente_id',
        'titulo',
        'descripcion',
        'valor_estimado',
        'fase',
        'probabilidad',
        'fecha_cierre_estimada',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'cliente_id' => 'integer',
            'valor_estimado' => 'decimal:2',
            'probabilidad' => 'integer',
            'fecha_cierre_estimada' => 'date',
        ];
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class)->withTrashed();
    }

    public function actividades(): HasMany
    {
        return $this->hasMany(Actividad::class);
    }

    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);

        if ($term === '') {
            return $query;
        }

        $like = '%'.$term.'%';

        return $query->where(function (Builder $builder) use ($like) {
            $builder
                ->where('titulo', 'like', $like)
                ->orWhere('descripcion', 'like', $like)
                ->orWhere('fase', 'like', $like)
                ->orWhere('estado', 'like', $like)
                ->orWhereHas('cliente', function (Builder $clienteQuery) use ($like) {
                    $clienteQuery
                        ->where('empresa', 'like', $like)
                        ->orWhere('nombre', 'like', $like)
                        ->orWhere('apellidos', 'like', $like);
                });
        });
    }
}
