<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tarea extends Model
{
    use HasFactory, SoftDeletes;

    public const PRIORIDADES = [
        'baja',
        'media',
        'alta',
    ];

    public const ESTADOS = [
        'pendiente',
        'en_progreso',
        'completada',
    ];

    protected $table = 'tareas';

    protected $fillable = [
        'cliente_id',
        'contacto_id',
        'oportunidad_id',
        'titulo',
        'descripcion',
        'prioridad',
        'estado',
        'fecha_vencimiento',
    ];

    protected function casts(): array
    {
        return [
            'fecha_vencimiento' => 'datetime',
        ];
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function contacto(): BelongsTo
    {
        return $this->belongsTo(Contacto::class);
    }

    public function oportunidad(): BelongsTo
    {
        return $this->belongsTo(Oportunidad::class);
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
                ->orWhere('descripcion', 'like', $like);
        });
    }
}
