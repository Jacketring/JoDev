<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TareaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cliente_id' => $this->cliente_id,
            'contacto_id' => $this->contacto_id,
            'oportunidad_id' => $this->oportunidad_id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'prioridad' => $this->prioridad,
            'estado' => $this->estado,
            'fecha_vencimiento' => optional($this->fecha_vencimiento)?->toIso8601String(),
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
            'deleted_at' => optional($this->deleted_at)?->toIso8601String(),
            'cliente' => $this->whenLoaded('cliente', function () {
                return [
                    'id' => $this->cliente?->id,
                    'nombre_completo' => $this->cliente?->nombre_completo,
                    'empresa' => $this->cliente?->empresa,
                ];
            }),
            'contacto' => $this->whenLoaded('contacto', function () {
                return [
                    'id' => $this->contacto?->id,
                    'nombre_completo' => $this->contacto?->nombre_completo,
                    'cargo' => $this->contacto?->cargo,
                ];
            }),
            'oportunidad' => $this->whenLoaded('oportunidad', function () {
                return [
                    'id' => $this->oportunidad?->id,
                    'titulo' => $this->oportunidad?->titulo,
                    'fase' => $this->oportunidad?->fase,
                ];
            }),
        ];
    }
}
