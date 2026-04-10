<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cliente_id' => $this->cliente_id,
            'nombre' => $this->nombre,
            'apellidos' => $this->apellidos,
            'nombre_completo' => $this->nombre_completo,
            'cargo' => $this->cargo,
            'email' => $this->email,
            'telefono' => $this->telefono,
            'movil' => $this->movil,
            'es_principal' => (bool) $this->es_principal,
            'notas' => $this->notas,
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
            'deleted_at' => optional($this->deleted_at)?->toIso8601String(),
            'cliente' => $this->whenLoaded('cliente', function () {
                return [
                    'id' => $this->cliente?->id,
                    'nombre_completo' => $this->cliente?->nombre_completo,
                    'empresa' => $this->cliente?->empresa,
                    'estado' => $this->cliente?->estado,
                ];
            }),
            'actividades' => ActividadResource::collection($this->whenLoaded('actividades')),
            'tareas' => TareaResource::collection($this->whenLoaded('tareas')),
        ];
    }
}
