<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasMany as HasManyRelation;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cliente extends Model
{
    use HasFactory, SoftDeletes;

    public const ESTADOS = [
        'activo',
        'inactivo',
    ];

    protected $table = 'clientes';

    protected $fillable = [
        'nombre',
        'apellidos',
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
        'origen',
        'estado',
        'notas',
    ];

    public function contactos(): HasMany
    {
        return $this->hasMany(Contacto::class);
    }

    public function oportunidades(): HasMany
    {
        return $this->hasMany(Oportunidad::class);
    }

    public function actividades(): HasMany
    {
        return $this->hasMany(Actividad::class);
    }

    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class);
    }

    public function users(): HasManyRelation
    {
        return $this->hasMany(User::class);
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
                ->orWhere('empresa', 'like', $like)
                ->orWhere('email', 'like', $like)
                ->orWhere('telefono', 'like', $like)
                ->orWhere('movil', 'like', $like);
        });
    }

    public function getNombreCompletoAttribute(): string
    {
        return trim(implode(' ', array_filter([$this->nombre, $this->apellidos])));
    }
}
