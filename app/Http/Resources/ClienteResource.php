<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'apellidos' => $this->apellidos,
            'nombre_completo' => $this->nombre_completo,
            'empresa' => $this->empresa,
            'email' => $this->email,
            'telefono' => $this->telefono,
            'movil' => $this->movil,
            'direccion' => $this->direccion,
            'ciudad' => $this->ciudad,
            'provincia' => $this->provincia,
            'codigo_postal' => $this->codigo_postal,
            'pais' => $this->pais,
            'web' => $this->web,
            'origen' => $this->origen,
            'estado' => $this->estado,
            'notas' => $this->notas,
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
            'deleted_at' => optional($this->deleted_at)?->toIso8601String(),
        ];
    }
}
