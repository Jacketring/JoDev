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
        'urgente',
    ];

    public const ESTADOS = [
        'pendiente',
        'en_progreso',
        'completada',
        'cancelada',
    ];

    protected $table = 'tareas';

    protected $fillable = [
        'cliente_id',
        'contacto_id',
        'oportunidad_id',
        'assigned_user_id',
        'titulo',
        'descripcion',
        'prioridad',
        'estado',
        'fecha_vencimiento',
    ];

    protected function casts(): array
    {
        return [
            'cliente_id' => 'integer',
            'contacto_id' => 'integer',
            'oportunidad_id' => 'integer',
            'assigned_user_id' => 'integer',
            'fecha_vencimiento' => 'datetime',
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

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
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
                ->orWhere('prioridad', 'like', $like)
                ->orWhere('estado', 'like', $like)
                ->orWhereHas('assignedUser', function (Builder $userQuery) use ($like) {
                    $userQuery
                        ->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like);
                });
        });
    }
}
