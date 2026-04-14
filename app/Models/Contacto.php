<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contacto extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contactos';

    protected $fillable = [
        'cliente_id',
        'nombre',
        'apellidos',
        'cargo',
        'email',
        'telefono',
        'movil',
        'es_principal',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'cliente_id' => 'integer',
            'es_principal' => 'boolean',
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
                ->where('nombre', 'like', $like)
                ->orWhere('apellidos', 'like', $like)
                ->orWhere('cargo', 'like', $like)
                ->orWhere('email', 'like', $like)
                ->orWhere('telefono', 'like', $like)
                ->orWhere('movil', 'like', $like)
                ->orWhereHas('cliente', function (Builder $clienteQuery) use ($like) {
                    $clienteQuery
                        ->where('empresa', 'like', $like)
                        ->orWhere('nombre', 'like', $like)
                        ->orWhere('apellidos', 'like', $like);
                });
        });
    }

    public function getNombreCompletoAttribute(): string
    {
        return trim(implode(' ', array_filter([$this->nombre, $this->apellidos])));
    }
}
