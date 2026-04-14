<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Actividad extends Model
{
    use HasFactory, SoftDeletes;

    public const TIPOS = [
        'llamada',
        'email',
        'reunion',
        'nota',
        'seguimiento',
    ];

    protected $table = 'actividades';

    protected $fillable = [
        'cliente_id',
        'contacto_id',
        'oportunidad_id',
        'tipo',
        'asunto',
        'descripcion',
        'fecha_actividad',
        'completada',
    ];

    protected function casts(): array
    {
        return [
            'cliente_id' => 'integer',
            'contacto_id' => 'integer',
            'oportunidad_id' => 'integer',
            'fecha_actividad' => 'datetime',
            'completada' => 'boolean',
        ];
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class)->withTrashed();
    }

    public function contacto(): BelongsTo
    {
        return $this->belongsTo(Contacto::class)->withTrashed();
    }

    public function oportunidad(): BelongsTo
    {
        return $this->belongsTo(Oportunidad::class)->withTrashed();
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
                ->where('tipo', 'like', $like)
                ->orWhere('asunto', 'like', $like)
                ->orWhere('descripcion', 'like', $like)
                ->orWhereHas('cliente', function (Builder $clienteQuery) use ($like) {
                    $clienteQuery
                        ->where('empresa', 'like', $like)
                        ->orWhere('nombre', 'like', $like)
                        ->orWhere('apellidos', 'like', $like);
                })
                ->orWhereHas('contacto', function (Builder $contactoQuery) use ($like) {
                    $contactoQuery
                        ->where('nombre', 'like', $like)
                        ->orWhere('apellidos', 'like', $like)
                        ->orWhere('email', 'like', $like);
                })
                ->orWhereHas('oportunidad', function (Builder $oportunidadQuery) use ($like) {
                    $oportunidadQuery->where('titulo', 'like', $like);
                });
        });
    }
}
